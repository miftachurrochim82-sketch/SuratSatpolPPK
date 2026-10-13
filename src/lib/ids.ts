import { randomBytes } from "node:crypto";

/** id pendek untuk kolom primary key varchar(32) */
export function makeId(prefix: string) {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${stamp}${noise}`.slice(0, 32);
}

const KODE_KARAKTER = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** kode verifikasi 8 karakter, tanpa huruf/angka yang mudah tertukar (0/O, 1/I) */
export function makeVerificationCode(length = 8) {
  const bytes = randomBytes(length);
  let hasil = "";
  for (let i = 0; i < length; i += 1) {
    hasil += KODE_KARAKTER[bytes[i] % KODE_KARAKTER.length];
  }
  return hasil;
}

export function makeAgendaNumber(terakhir: number | null | undefined) {
  return (terakhir ?? 0) + 1;
}

/** 005/SATPOL-PPK/X/2026 */
export function makeOfficialNumber(urutan: number, romawi: string, tahun: number, kode = "SATPOL-PPK") {
  return `${String(urutan).padStart(3, "0")}/${kode}/${romawi}/${tahun}`;
}
