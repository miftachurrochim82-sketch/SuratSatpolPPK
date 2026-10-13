"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { appSettings, classifications, staff } from "@/db/schema";
import { makeId } from "@/lib/ids";
import type { ActionState } from "@/lib/action-state";

function teks(formData: FormData, kunci: string) {
  const nilai = formData.get(kunci);
  return typeof nilai === "string" ? nilai.trim() : "";
}

/* ------------------------------ KLASIFIKASI ------------------------------- */

export async function createClassification(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = teks(formData, "code").toUpperCase();
  const name = teks(formData, "name");

  if (!code || !name) {
    return { ok: false, message: "Kode dan nama klasifikasi wajib diisi." };
  }

  try {
    const [ada] = await db
      .select({ code: classifications.code })
      .from(classifications)
      .where(eq(classifications.code, code))
      .limit(1);

    if (ada) {
      return { ok: false, message: `Kode ${code} sudah dipakai.` };
    }

    await db.insert(classifications).values({
      code,
      name,
      description: teks(formData, "description") || null,
    });

    revalidatePath("/klasifikasi");
    revalidatePath("/surat-masuk");
    revalidatePath("/surat-keluar");
    return { ok: true, message: `Klasifikasi ${code} ditambahkan.` };
  } catch (error) {
    const detail = error instanceof Error ? ` (${error.message})` : "";
    return { ok: false, message: `Gagal menambah klasifikasi.${detail}` };
  }
}

export async function deleteClassification(formData: FormData) {
  const code = teks(formData, "code");
  if (!code) return;
  try {
    await db.delete(classifications).where(eq(classifications.code, code));
    revalidatePath("/klasifikasi");
  } catch {
    /* abaikan: mungkin masih dipakai surat lain */
  }
}

/**
 * Dipakai tombol "Tambahkan" pada daftar usulan.
 * Sengaja terpisah dari createClassification karena form biasa tidak memakai
 * useActionState, sehingga tidak butuh nilai kembalian.
 */
export async function quickAddClassification(formData: FormData): Promise<void> {
  const code = teks(formData, "code").toUpperCase();
  const name = teks(formData, "name");
  if (!code || !name) return;
  try {
    await db
      .insert(classifications)
      .values({ code, name, description: teks(formData, "description") || null })
      .onConflictDoNothing();
    revalidatePath("/klasifikasi");
    revalidatePath("/surat-masuk");
    revalidatePath("/surat-keluar");
  } catch {
    /* abaikan */
  }
}

/* -------------------------------- PEGAWAI --------------------------------- */

export async function createStaff(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = teks(formData, "name");
  const position = teks(formData, "position");

  if (!name || !position) {
    return { ok: false, message: "Nama dan jabatan wajib diisi." };
  }

  try {
    await db.insert(staff).values({
      id: makeId("PG"),
      employeeNumber: teks(formData, "employeeNumber") || null,
      name,
      position,
      whatsapp: normalisasiWa(teks(formData, "whatsapp")),
      status: teks(formData, "status") || "Aktif",
    });

    revalidatePath("/pegawai");
    revalidatePath("/disposisi");
    return { ok: true, message: `Pegawai ${name} ditambahkan.` };
  } catch (error) {
    const detail = error instanceof Error ? ` (${error.message})` : "";
    return { ok: false, message: `Gagal menambah pegawai.${detail}` };
  }
}

export async function deleteStaff(formData: FormData) {
  const id = teks(formData, "id");
  if (!id) return;
  try {
    await db.delete(staff).where(eq(staff.id, id));
    revalidatePath("/pegawai");
  } catch {
    /* abaikan: pegawai mungkin masih terhubung ke disposisi */
  }
}

/** 08123456789 -> 628123456789 supaya siap dipakai link wa.me */
function normalisasiWa(nilai: string) {
  if (!nilai) return null;
  const angka = nilai.replace(/[^\d]/g, "");
  if (!angka) return null;
  if (angka.startsWith("62")) return angka;
  if (angka.startsWith("0")) return `62${angka.slice(1)}`;
  if (angka.startsWith("8")) return `62${angka}`;
  return angka;
}

/* ------------------------------ PENGATURAN -------------------------------- */

export async function saveSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const kunci = [
    "institution_name",
    "institution_area",
    "institution_address",
    "institution_phone",
    "institution_email",
    "head_name",
    "head_position",
    "letter_code",
    "wa_gateway_url",
  ] as const;

  try {
    for (const key of kunci) {
      const value = teks(formData, key);
      await db
        .insert(appSettings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: appSettings.key,
          set: { value, updatedAt: new Date() },
        });
    }

    revalidatePath("/", "layout");
    revalidatePath("/pengaturan");
    return { ok: true, message: "Pengaturan berhasil disimpan." };
  } catch (error) {
    const detail = error instanceof Error ? ` (${error.message})` : "";
    return { ok: false, message: `Gagal menyimpan pengaturan.${detail}` };
  }
}
