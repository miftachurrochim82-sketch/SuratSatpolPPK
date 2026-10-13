"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { dispositions, incomingLetters, staff } from "@/db/schema";
import { makeId } from "@/lib/ids";
import type { ActionState } from "@/lib/action-state";

function teks(formData: FormData, kunci: string) {
  const nilai = formData.get(kunci);
  return typeof nilai === "string" ? nilai.trim() : "";
}

export async function createDisposition(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const incomingLetterId = teks(formData, "incomingLetterId");
  const staffId = teks(formData, "staffId");
  const instruction = teks(formData, "instruction");
  const dispositionDate = teks(formData, "dispositionDate");

  if (!incomingLetterId || !staffId || !instruction || !dispositionDate) {
    return { ok: false, message: "Pilih surat, pegawai, instruksi, dan tanggal disposisi." };
  }

  try {
    const [surat] = await db
      .select()
      .from(incomingLetters)
      .where(eq(incomingLetters.id, incomingLetterId))
      .limit(1);

    if (!surat) {
      return { ok: false, message: "Surat masuk tidak ditemukan." };
    }

    const [pegawai] = await db.select().from(staff).where(eq(staff.id, staffId)).limit(1);
    if (!pegawai) {
      return { ok: false, message: "Pegawai tidak ditemukan." };
    }

    const nomorWa = pegawai.whatsapp?.trim() || null;

    await db.insert(dispositions).values({
      id: makeId("DP"),
      incomingLetterId: surat.id,
      letterNumber: surat.letterNumber,
      subject: surat.subject,
      dispositionDate,
      dueDate: teks(formData, "dueDate") || null,
      instruction,
      leaderNote: teks(formData, "leaderNote") || null,
      staffId: pegawai.id,
      staffName: pegawai.name,
      whatsapp: nomorWa,
      whatsappStatus: nomorWa ? "Siap Dikirim" : "Tidak Ada Nomor",
      followUpStatus: "Pending",
    });

    await db
      .update(incomingLetters)
      .set({ dispositionStatus: "Sudah" })
      .where(eq(incomingLetters.id, surat.id));

    revalidatePath("/");
    revalidatePath("/disposisi");
    revalidatePath("/surat-masuk");
    return { ok: true, message: `Disposisi untuk ${pegawai.name} berhasil dibuat.` };
  } catch (error) {
    const detail = error instanceof Error ? ` (${error.message})` : "";
    return { ok: false, message: `Gagal membuat disposisi.${detail}` };
  }
}

export async function setDispositionStatus(formData: FormData) {
  const id = teks(formData, "id");
  const status = teks(formData, "status");
  if (!id || !status) return;
  try {
    await db
      .update(dispositions)
      .set({ followUpStatus: status })
      .where(eq(dispositions.id, id));
    revalidatePath("/");
    revalidatePath("/disposisi");
  } catch {
    /* abaikan */
  }
}

export async function markWhatsappSent(formData: FormData) {
  const id = teks(formData, "id");
  if (!id) return;
  try {
    await db
      .update(dispositions)
      .set({ whatsappStatus: "Terkirim" })
      .where(eq(dispositions.id, id));
    revalidatePath("/disposisi");
  } catch {
    /* abaikan */
  }
}

export async function deleteDisposition(formData: FormData) {
  const id = teks(formData, "id");
  if (!id) return;
  try {
    const [baris] = await db
      .select({ incomingLetterId: dispositions.incomingLetterId })
      .from(dispositions)
      .where(eq(dispositions.id, id))
      .limit(1);

    await db.delete(dispositions).where(eq(dispositions.id, id));

    // kalau surat itu tidak punya disposisi lain, kembalikan statusnya ke "Belum"
    if (baris?.incomingLetterId) {
      const sisa = await db
        .select({ id: dispositions.id })
        .from(dispositions)
        .where(eq(dispositions.incomingLetterId, baris.incomingLetterId));

      if (sisa.length === 0) {
        await db
          .update(incomingLetters)
          .set({ dispositionStatus: "Belum" })
          .where(eq(incomingLetters.id, baris.incomingLetterId));
      }
    }

    revalidatePath("/");
    revalidatePath("/disposisi");
    revalidatePath("/surat-masuk");
  } catch {
    /* abaikan */
  }
}
