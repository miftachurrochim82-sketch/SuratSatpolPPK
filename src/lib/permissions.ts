/**
 * Definisi peran dan izin akses.
 *
 * Berkas ini murni (tanpa API server maupun Node) supaya aman diimpor
 * dari komponen klien seperti AppShell.
 */

export const PERAN = ["admin", "tu", "pimpinan", "pegawai"] as const;
export type Peran = (typeof PERAN)[number];

export type Izin =
  | "suratMasukTulis"
  | "suratKeluarTulis"
  | "disposisiTulis"
  | "masterTulis"
  | "pengaturanTulis"
  | "hapus"
  | "pengguna";

type DefinisiPeran = {
  label: string;
  singkat: string;
  keterangan: string;
  izin: Record<Izin, boolean>;
};

const TIDAK = {
  suratMasukTulis: false,
  suratKeluarTulis: false,
  disposisiTulis: false,
  masterTulis: false,
  pengaturanTulis: false,
  hapus: false,
  pengguna: false,
} satisfies Record<Izin, boolean>;

export const DEFINISI: Record<Peran, DefinisiPeran> = {
  admin: {
    label: "Administrator",
    singkat: "Admin",
    keterangan: "Akses penuh, termasuk data master, pengaturan, dan pengelolaan pengguna.",
    izin: {
      suratMasukTulis: true,
      suratKeluarTulis: true,
      disposisiTulis: true,
      masterTulis: true,
      pengaturanTulis: true,
      hapus: true,
      pengguna: true,
    },
  },
  tu: {
    label: "Tata Usaha",
    singkat: "TU",
    keterangan:
      "Mencatat dan mengelola surat masuk, surat keluar, serta disposisi. Tidak dapat menghapus data.",
    izin: {
      ...TIDAK,
      suratMasukTulis: true,
      suratKeluarTulis: true,
      disposisiTulis: true,
    },
  },
  pimpinan: {
    label: "Pimpinan",
    singkat: "Pimpinan",
    keterangan:
      "Melihat seluruh surat dan memberi disposisi. Tidak dapat mengubah catatan surat.",
    izin: {
      ...TIDAK,
      disposisiTulis: true,
    },
  },
  pegawai: {
    label: "Pegawai",
    singkat: "Pegawai",
    keterangan:
      "Hanya melihat disposisi yang ditujukan kepada dirinya. Tidak dapat mengubah data apa pun.",
    izin: { ...TIDAK },
  },
};

export function boleh(peran: string, izin: Izin) {
  const definisi = DEFINISI[peran as Peran];
  if (!definisi) return false;
  return definisi.izin[izin];
}

/** Definisi peran dengan cadangan aman, untuk peran yang tidak dikenal. */
export function definisiPeran(peran: string): DefinisiPeran {
  return DEFINISI[peran as Peran] ?? DEFINISI.pegawai;
}

export function labelPeran(peran: string) {
  return definisiPeran(peran).label;
}

export function peranValid(nilai: string): nilai is Peran {
  return (PERAN as readonly string[]).includes(nilai);
}

/** Ringkasan menu yang boleh tampil, dihitung sekali di server. */
export function menuBoleh(peran: string) {
  return {
    surat: boleh(peran, "suratMasukTulis") || boleh(peran, "suratKeluarTulis") || peran !== "pegawai",
    disposisi: true,
    master: peran !== "pegawai",
    pengguna: boleh(peran, "pengguna"),
    pengaturan: peran !== "pegawai",
  };
}
