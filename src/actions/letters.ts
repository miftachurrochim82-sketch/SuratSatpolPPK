"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { attachments, incomingLetters, outgoingLetters } from "@/db/schema";
import { makeAgendaNumber, makeId, makeOfficialNumber, makeVerificationCode } from "@/lib/ids";
import { romanMonth, yearOf } from "@/lib/format";
import { getSettings } from "@/lib/settings";

import type { ActionState } from "@/lib/action-state";

function teks(formData: FormData, kunci: string) {
  const nilai = formData.get(kunci);
  return typeof nilai === "string" ? nilai.trim() : "";
}

async function simpanLampiran(formData: FormData): Promise<number | null> {
  const base64 = teks(formData, "attachmentData");
  const nama = teks(formData, "attachmentName");
  const mime = teks(formData, "attachmentMime");
  if (!base64 || !nama) return null;

  const [row] = await db
    .insert(attachments)
    .values({
      fileName: nama.slice(0, 255),
      mimeType: (mime || "application/octet-stream").slice(0, 120),
      base64Data: base64,
    })
    .returning({ id: attachments.id });

  return row?.id ?? null;
}

async function agendaBerikutnya(
  tabel: typeof incomingLetters | typeof outgoingLetters,
) {
  const kolom = tabel === incomingLetters ? incomingLetters.agendaNo : outgoingLetters.agendaNo;
  const [row] = await db.select({ maks: sql<number | null>`max(${kolom})` }).from(tabel);
  return makeAgendaNumber(Number(row?.maks ?? 0));
}

/* ------------------------------- SURAT MASUK ------------------------------- */

export async function createIncomingLetter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const letterNumber = teks(formData, "letterNumber");
  const sender = teks(formData, "sender");
  const subject = teks(formData, "subject");
  const letterDate = teks(formData, "letterDate");
  const receivedDate = teks(formData, "receivedDate");
  const classificationCode = teks(formData, "classificationCode");

  if (!letterNumber || !sender || !subject || !letterDate || !receivedDate || !classificationCode) {
    return { ok: false, message: "Lengkapi dulu kolom bertanda wajib." };
  }

  try {
    const agendaNo = await agendaBerikutnya(incomingLetters);
    const attachmentId = await simpanLampiran(formData);

    await db.insert(incomingLetters).values({
      id: makeId("SM"),
      agendaNo,
      letterNumber,
      letterDate,
      receivedDate,
      sender,
      subject,
      classificationCode,
      securityLevel: teks(formData, "securityLevel") || "Biasa",
      attachmentId,
      dispositionStatus: "Belum",
      createdBy: teks(formData, "createdBy") || "Admin TU",
    });

    revalidatePath("/");
    revalidatePath("/surat-masuk");
    revalidatePath("/disposisi");
    return { ok: true, message: `Surat masuk agenda No. ${agendaNo} berhasil dicatat.` };
  } catch (error) {
    return { ok: false, message: pesanError(error, "Gagal menyimpan surat masuk.") };
  }
}

export async function deleteIncomingLetter(formData: FormData) {
  const id = teks(formData, "id");
  if (!id) return;
  try {
    await db.delete(incomingLetters).where(eq(incomingLetters.id, id));
    revalidatePath("/");
    revalidatePath("/surat-masuk");
    revalidatePath("/disposisi");
  } catch {
    /* diamkan: baris mungkin sudah terhapus */
  }
}

/* ------------------------------- SURAT KELUAR ------------------------------ */

export async function createOutgoingLetter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const recipient = teks(formData, "recipient");
  const subject = teks(formData, "subject");
  const letterDate = teks(formData, "letterDate");
  const classificationCode = teks(formData, "classificationCode");
  const signer = teks(formData, "signer");

  if (!recipient || !subject || !letterDate || !classificationCode || !signer) {
    return { ok: false, message: "Lengkapi dulu kolom bertanda wajib." };
  }

  try {
    const settings = await getSettings();
    const agendaNo = await agendaBerikutnya(outgoingLetters);
    const tanggal = new Date(letterDate);
    const officialNumber = makeOfficialNumber(
      agendaNo,
      romanMonth(tanggal),
      yearOf(tanggal),
      settings.letter_code,
    );

    // pastikan kode verifikasi tidak bentrok
    let verificationCode = makeVerificationCode();
    for (let percobaan = 0; percobaan < 5; percobaan += 1) {
      const [bentrok] = await db
        .select({ id: outgoingLetters.id })
        .from(outgoingLetters)
        .where(eq(outgoingLetters.verificationCode, verificationCode))
        .limit(1);
      if (!bentrok) break;
      verificationCode = makeVerificationCode();
    }

    const attachmentId = await simpanLampiran(formData);

    await db.insert(outgoingLetters).values({
      id: makeId("SK"),
      agendaNo,
      officialNumber,
      letterDate,
      recipient,
      subject,
      classificationCode,
      signer,
      attachmentId,
      verificationCode,
      archiveStatus: teks(formData, "archiveStatus") || "Draft",
      createdBy: teks(formData, "createdBy") || "Admin TU",
    });

    revalidatePath("/");
    revalidatePath("/surat-keluar");
    return {
      ok: true,
      message: `Surat keluar ${officialNumber} tersimpan. Kode verifikasi: ${verificationCode}`,
    };
  } catch (error) {
    return { ok: false, message: pesanError(error, "Gagal menyimpan surat keluar.") };
  }
}

export async function updateArchiveStatus(formData: FormData) {
  const id = teks(formData, "id");
  const status = teks(formData, "status");
  if (!id || !status) return;
  try {
    await db
      .update(outgoingLetters)
      .set({ archiveStatus: status })
      .where(eq(outgoingLetters.id, id));
    revalidatePath("/");
    revalidatePath("/surat-keluar");
  } catch {
    /* abaikan */
  }
}

export async function deleteOutgoingLetter(formData: FormData) {
  const id = teks(formData, "id");
  if (!id) return;
  try {
    await db.delete(outgoingLetters).where(eq(outgoingLetters.id, id));
    revalidatePath("/");
    revalidatePath("/surat-keluar");
  } catch {
    /* abaikan */
  }
}

function pesanError(error: unknown, bawaan: string) {
  if (error instanceof Error) {
    if (error.message.includes("outgoing_letters_official_number_unique")) {
      return "Nomor surat itu sudah dipakai. Coba lagi, nomor akan dibuat ulang otomatis.";
    }
    if (error.message.includes("DATABASE_URL")) {
      return "Database belum tersambung. Periksa DATABASE_URL di file .env.";
    }
    return `${bawaan} (${error.message})`;
  }
  return bawaan;
}
