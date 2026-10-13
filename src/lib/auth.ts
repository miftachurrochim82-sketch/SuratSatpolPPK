import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, lt, or } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { boleh, type Izin, type Peran } from "@/lib/permissions";

const NAMA_COOKIE = "esurat_sesi";
const DURASI_HARI = 7;
const PANJANG_KUNCI = 64;

export type PenggunaAktif = {
  id: string;
  username: string;
  name: string;
  role: Peran;
  staffId: string | null;
};

/* --------------------------------- Sandi --------------------------------- */

/**
 * Format tersimpan: scrypt$<salt>$<kunci>
 * Memakai scrypt bawaan Node, jadi tidak perlu menambah dependensi hashing.
 */
export function hashPassword(sandi: string) {
  const garam = randomBytes(16).toString("hex");
  const kunci = scryptSync(sandi, garam, PANJANG_KUNCI).toString("hex");
  return `scrypt$${garam}$${kunci}`;
}

export function periksaPassword(sandi: string, tersimpan: string) {
  const bagian = tersimpan.split("$");
  if (bagian.length !== 3 || bagian[0] !== "scrypt") return false;
  const [, garam, kunciHex] = bagian;
  if (!garam || !kunciHex) return false;

  const asli = Buffer.from(kunciHex, "hex");
  const hitung = scryptSync(sandi, garam, asli.length || PANJANG_KUNCI);
  if (hitung.length !== asli.length) return false;
  return timingSafeEqual(hitung, asli);
}

export function periksaKekuatanSandi(sandi: string): string | null {
  if (sandi.length < 8) return "Kata sandi minimal 8 karakter.";
  if (!/[A-Za-z]/.test(sandi)) return "Kata sandi harus memuat huruf.";
  if (!/\d/.test(sandi)) return "Kata sandi harus memuat angka.";
  return null;
}

/* -------------------------------- Sesi ---------------------------------- */

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function buatSesi(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + DURASI_HARI * 86_400_000);

  // bersihkan sesi yang sudah kedaluwarsa sekalian
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date())).catch(() => undefined);

  await db.insert(sessions).values({ tokenHash: hashToken(token), userId, expiresAt });

  const store = await cookies();
  store.set(NAMA_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function hapusSesi() {
  const store = await cookies();
  const token = store.get(NAMA_COOKIE)?.value;
  if (token) {
    await db
      .delete(sessions)
      .where(eq(sessions.tokenHash, hashToken(token)))
      .catch(() => undefined);
  }
  store.delete(NAMA_COOKIE);
}

/** Membaca pengguna yang sedang masuk. Mengembalikan null bila tidak ada. */
export async function penggunaSaatIni(): Promise<PenggunaAktif | null> {
  const store = await cookies();
  const token = store.get(NAMA_COOKIE)?.value;
  if (!token) return null;

  try {
    const [baris] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        role: users.role,
        staffId: users.staffId,
        status: users.status,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, hashToken(token)),
          gt(sessions.expiresAt, new Date()),
          or(eq(users.status, "Aktif"), eq(users.status, "Cuti")),
        ),
      )
      .limit(1);

    if (!baris) return null;
    return {
      id: baris.id,
      username: baris.username,
      name: baris.name,
      role: baris.role as Peran,
      staffId: baris.staffId,
    };
  } catch {
    // database belum siap — perlakukan sebagai belum masuk
    return null;
  }
}

/** Untuk halaman: alihkan ke /login bila belum masuk. */
export async function wajibMasuk(): Promise<PenggunaAktif> {
  const pengguna = await penggunaSaatIni();
  if (!pengguna) redirect("/login");
  return pengguna;
}

/** Untuk halaman: alihkan bila peran tidak punya izin. */
export async function wajibIzin(izin: Izin): Promise<PenggunaAktif> {
  const pengguna = await wajibMasuk();
  if (!boleh(pengguna.role, izin)) redirect("/?izin=ditolak");
  return pengguna;
}

/**
 * Untuk server action yang mengembalikan status.
 * Mengembalikan pesan galat bila tidak berizin, atau null bila boleh lanjut.
 */
export async function cekIzinAksi(izin: Izin): Promise<{ pengguna: PenggunaAktif } | { pesan: string }> {
  const pengguna = await penggunaSaatIni();
  if (!pengguna) {
    return { pesan: "Sesi Anda sudah berakhir. Silakan masuk kembali." };
  }
  if (!boleh(pengguna.role, izin)) {
    return { pesan: "Peran Anda tidak punya izin untuk tindakan ini." };
  }
  return { pengguna };
}
