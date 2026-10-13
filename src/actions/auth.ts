"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  buatSesi,
  hapusSesi,
  hashPassword,
  periksaKekuatanSandi,
  periksaPassword,
  penggunaSaatIni,
} from "@/lib/auth";
import type { ActionState } from "@/lib/action-state";

function teks(formData: FormData, kunci: string) {
  const nilai = formData.get(kunci);
  return typeof nilai === "string" ? nilai.trim() : "";
}

/** Hanya izinkan tujuan internal supaya tidak bisa dipakai open redirect. */
function tujuanAman(nilai: string) {
  if (!nilai.startsWith("/") || nilai.startsWith("//")) return "/";
  return nilai;
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const username = teks(formData, "username").toLowerCase();
  const sandi = String(formData.get("password") ?? "");
  const tujuan = tujuanAman(teks(formData, "next") || "/");

  if (!username || !sandi) {
    return { ok: false, message: "Isi nama pengguna dan kata sandi." };
  }

  let berhasil = false;

  try {
    const [pengguna] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    // pesan sengaja disamakan untuk keduanya, agar tidak membocorkan
    // nama pengguna mana yang benar-benar terdaftar
    if (!pengguna || !periksaPassword(sandi, pengguna.passwordHash)) {
      return { ok: false, message: "Nama pengguna atau kata sandi salah." };
    }

    if (pengguna.status !== "Aktif") {
      return {
        ok: false,
        message:
          pengguna.status === "Cuti"
            ? "Akun ini sedang ditandai cuti. Hubungi administrator."
            : "Akun ini tidak aktif. Hubungi administrator.",
      };
    }

    await buatSesi(pengguna.id);
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, pengguna.id));
    berhasil = true;
  } catch {
    return {
      ok: false,
      message: "Database belum tersambung. Periksa DATABASE_URL lalu jalankan npm run db:migrate.",
    };
  }

  // redirect() dipanggil DI LUAR try/catch — ia bekerja dengan melempar
  // penanda khusus yang akan ikut tertelan kalau berada di dalam catch.
  if (berhasil) redirect(tujuan);

  return { ok: false, message: "Tidak dapat masuk. Coba lagi." };
}

export async function logout() {
  await hapusSesi();
  redirect("/login");
}

export async function ubahSandiSendiri(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const pengguna = await penggunaSaatIni();
  if (!pengguna) return { ok: false, message: "Sesi Anda sudah berakhir. Masuk kembali." };

  const lama = String(formData.get("sandiLama") ?? "");
  const baru = String(formData.get("sandiBaru") ?? "");
  const ulang = String(formData.get("sandiUlang") ?? "");

  if (!lama || !baru || !ulang) {
    return { ok: false, message: "Lengkapi ketiga kolom kata sandi." };
  }
  if (baru !== ulang) {
    return { ok: false, message: "Konfirmasi kata sandi tidak sama." };
  }
  const lemah = periksaKekuatanSandi(baru);
  if (lemah) return { ok: false, message: lemah };

  try {
    const [baris] = await db.select().from(users).where(eq(users.id, pengguna.id)).limit(1);
    if (!baris || !periksaPassword(lama, baris.passwordHash)) {
      return { ok: false, message: "Kata sandi lama tidak sesuai." };
    }

    await db
      .update(users)
      .set({ passwordHash: hashPassword(baru) })
      .where(eq(users.id, pengguna.id));

    return { ok: true, message: "Kata sandi berhasil diubah." };
  } catch {
    return { ok: false, message: "Gagal mengubah kata sandi." };
  }
}
