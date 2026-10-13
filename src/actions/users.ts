"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { hashPassword, periksaKekuatanSandi } from "@/lib/auth";
import { peranValid } from "@/lib/permissions";
import { makeId } from "@/lib/ids";
import type { ActionState } from "@/lib/action-state";
import { cekIzinAksi } from "@/lib/auth";

function teks(formData: FormData, kunci: string) {
  const nilai = formData.get(kunci);
  return typeof nilai === "string" ? nilai.trim() : "";
}

const STATUS_VALID = ["Aktif", "Cuti", "Nonaktif"];

export async function createUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const izin = await cekIzinAksi("pengguna");
  if ("pesan" in izin) return { ok: false, message: izin.pesan };

  const username = teks(formData, "username").toLowerCase();
  const name = teks(formData, "name");
  const peran = teks(formData, "role");
  const sandi = String(formData.get("password") ?? "");

  if (!username || !name || !peran || !sandi) {
    return { ok: false, message: "Nama pengguna, nama petugas, peran, dan kata sandi wajib diisi." };
  }
  if (!/^[a-z0-9._-]{3,60}$/.test(username)) {
    return {
      ok: false,
      message: "Nama pengguna hanya boleh huruf kecil, angka, titik, garis bawah, atau strip (3–60 karakter).",
    };
  }
  if (!peranValid(peran)) {
    return { ok: false, message: "Peran tidak dikenal." };
  }
  const lemah = periksaKekuatanSandi(sandi);
  if (lemah) return { ok: false, message: lemah };

  try {
    const [ada] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (ada) {
      return { ok: false, message: `Nama pengguna "${username}" sudah dipakai.` };
    }

    await db.insert(users).values({
      id: makeId("US"),
      username,
      name,
      passwordHash: hashPassword(sandi),
      role: peran,
      staffId: teks(formData, "staffId") || null,
      status: "Aktif",
    });

    revalidatePath("/pengguna");
    return { ok: true, message: `Pengguna "${username}" dibuat dengan peran ${peran}.` };
  } catch (error) {
    const detail = error instanceof Error ? ` (${error.message})` : "";
    return { ok: false, message: `Gagal membuat pengguna.${detail}` };
  }
}

export async function ubahPeranUser(formData: FormData) {
  const izin = await cekIzinAksi("pengguna");
  if ("pesan" in izin) return;

  const id = teks(formData, "id");
  const peran = teks(formData, "role");
  if (!id || !peranValid(peran)) return;

  // jangan biarkan administrator menurunkan perannya sendiri —
  // dikhawatirkan tidak ada administrator tersisa
  if (id === izin.pengguna.id) return;

  try {
    await db.update(users).set({ role: peran }).where(eq(users.id, id));
    // sesi lama dihapus agar peran baru langsung berlaku
    await db.delete(sessions).where(eq(sessions.userId, id));
    revalidatePath("/pengguna");
  } catch {
    /* abaikan */
  }
}

export async function ubahStatusUser(formData: FormData) {
  const izin = await cekIzinAksi("pengguna");
  if ("pesan" in izin) return;

  const id = teks(formData, "id");
  const status = teks(formData, "status");
  if (!id || !STATUS_VALID.includes(status)) return;
  if (id === izin.pengguna.id) return; // tidak bisa menonaktifkan diri sendiri

  try {
    await db.update(users).set({ status }).where(eq(users.id, id));
    if (status !== "Aktif") {
      await db.delete(sessions).where(eq(sessions.userId, id));
    }
    revalidatePath("/pengguna");
  } catch {
    /* abaikan */
  }
}

export async function resetSandiUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const izin = await cekIzinAksi("pengguna");
  if ("pesan" in izin) return { ok: false, message: izin.pesan };

  const id = teks(formData, "id");
  const sandi = String(formData.get("password") ?? "");

  if (!id || !sandi) {
    return { ok: false, message: "Pilih pengguna dan isi kata sandi baru." };
  }
  const lemah = periksaKekuatanSandi(sandi);
  if (lemah) return { ok: false, message: lemah };

  try {
    const [target] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!target) return { ok: false, message: "Pengguna tidak ditemukan." };

    await db.update(users).set({ passwordHash: hashPassword(sandi) }).where(eq(users.id, id));
    // paksa masuk ulang dengan kata sandi baru
    await db.delete(sessions).where(eq(sessions.userId, id));

    revalidatePath("/pengguna");
    return { ok: true, message: `Kata sandi "${target.username}" direset. Pengguna harus masuk kembali.` };
  } catch {
    return { ok: false, message: "Gagal mereset kata sandi." };
  }
}

export async function deleteUser(formData: FormData) {
  const izin = await cekIzinAksi("pengguna");
  if ("pesan" in izin) return;

  const id = teks(formData, "id");
  if (!id || id === izin.pengguna.id) return;

  try {
    // sisakan minimal satu administrator
    const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, id)).limit(1);
    if (target?.role === "admin") {
      const [row] = await db
        .select({ jumlah: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.role, "admin"));
      if ((row?.jumlah ?? 0) <= 1) return;
    }

    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/pengguna");
  } catch {
    /* abaikan */
  }
}
