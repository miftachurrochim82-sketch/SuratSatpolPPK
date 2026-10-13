import { db } from "@/db";
import { appSettings } from "@/db/schema";

export type AppSettings = {
  institution_name: string;
  institution_area: string;
  institution_address: string;
  institution_phone: string;
  institution_email: string;
  head_name: string;
  head_position: string;
  letter_code: string;
  wa_gateway_url: string;
  wa_status: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  institution_name: "SATPOL PP DAN PEMADAM KEBAKARAN",
  institution_area: "KABUPATEN TRENGGALEK",
  institution_address: "Jl. Merdeka No. 1, Trenggalek, Jawa Timur 66311",
  institution_phone: "(0355) 791234",
  institution_email: "satpolpp@trenggalekkab.go.id",
  head_name: "Drs. H. Bambang Setiawan, M.Si.",
  head_position: "Kepala Satpol PP dan Damkar",
  letter_code: "SATPOL-PPK",
  wa_gateway_url: "",
  wa_status: "Belum Terhubung",
};

/**
 * Membaca pengaturan instansi. Kalau tabel belum ada atau database belum siap,
 * aplikasi tetap jalan memakai nilai bawaan sehingga halaman tidak ikut mati.
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const rows = await db.select().from(appSettings);
    const tersimpan = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return { ...DEFAULT_SETTINGS, ...tersimpan } as AppSettings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** true kalau database bisa dihubungi — dipakai untuk menampilkan peringatan */
export async function isDatabaseReady() {
  try {
    await db.execute("select 1");
    return true;
  } catch {
    return false;
  }
}
