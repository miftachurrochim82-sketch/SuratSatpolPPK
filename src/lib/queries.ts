import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  classifications,
  dispositions,
  incomingLetters,
  outgoingLetters,
  staff,
  users,
} from "@/db/schema";
import type { PenggunaAktif } from "@/lib/auth";


export type IncomingRow = typeof incomingLetters.$inferSelect;
export type OutgoingRow = typeof outgoingLetters.$inferSelect;
export type DispositionRow = typeof dispositions.$inferSelect;
export type ClassificationRow = typeof classifications.$inferSelect;
export type StaffRow = typeof staff.$inferSelect;

/** Kalau database belum siap, halaman tetap tampil dengan daftar kosong. */
async function aman<T>(kerja: () => Promise<T>, cadangan: T): Promise<T> {
  try {
    return await kerja();
  } catch {
    return cadangan;
  }
}

/**
 * Jumlah disposisi pending.
 *
 * Untuk peran "pegawai", angka dibatasi hanya disposisi yang ditujukan
 * kepadanya — jangan sampai ia melihat beban kerja pegawai lain.
 */
export async function countPendingDispositions(pengguna?: PenggunaAktif | null) {
  const batasiStaff = pengguna?.role === "pegawai" ? pengguna.staffId : null;

  return aman(async () => {
    const syarat = batasiStaff
      ? and(eq(dispositions.followUpStatus, "Pending"), eq(dispositions.staffId, batasiStaff))
      : eq(dispositions.followUpStatus, "Pending");

    const [row] = await db
      .select({ jumlah: sql<number>`count(*)::int` })
      .from(dispositions)
      .where(syarat);
    return row?.jumlah ?? 0;
  }, 0);
}

export async function listIncomingLetters() {
  return aman(
    () =>
      db
        .select()
        .from(incomingLetters)
        .orderBy(desc(incomingLetters.agendaNo))
        .limit(200),
    [] as IncomingRow[],
  );
}

export async function listOutgoingLetters() {
  return aman(
    () =>
      db
        .select()
        .from(outgoingLetters)
        .orderBy(desc(outgoingLetters.agendaNo))
        .limit(200),
    [] as OutgoingRow[],
  );
}

export async function listDispositions(pengguna?: PenggunaAktif | null) {
  const batasiStaff = pengguna?.role === "pegawai" ? pengguna.staffId : null;

  if (pengguna?.role === "pegawai" && !batasiStaff) {
    // akun pegawai tanpa tautan ke data pegawai tidak melihat disposisi apa pun
    return [] as DispositionRow[];
  }

  return aman(
    () =>
      batasiStaff
        ? db
            .select()
            .from(dispositions)
            .where(eq(dispositions.staffId, batasiStaff))
            .orderBy(desc(dispositions.createdAt))
            .limit(200)
        : db.select().from(dispositions).orderBy(desc(dispositions.createdAt)).limit(200),
    [] as DispositionRow[],
  );
}

export async function listUsers() {
  return aman(
    () =>
      db
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          role: users.role,
          staffId: users.staffId,
          status: users.status,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(users.username),
    [] as {
      id: string;
      username: string;
      name: string;
      role: string;
      staffId: string | null;
      status: string;
      lastLoginAt: Date | null;
      createdAt: Date;
    }[],
  );
}

export async function listClassifications() {
  return aman(
    () => db.select().from(classifications).orderBy(classifications.code),
    [] as ClassificationRow[],
  );
}

export async function listStaff() {
  return aman(() => db.select().from(staff).orderBy(staff.name), [] as StaffRow[]);
}

export async function getIncomingByVerification(code: string) {
  return aman(async () => {
    const [row] = await db
      .select()
      .from(outgoingLetters)
      .where(eq(outgoingLetters.verificationCode, code))
      .limit(1);
    return row ?? null;
  }, null as OutgoingRow | null);
}

export async function nextAgendaIncoming() {
  return aman(async () => {
    const [row] = await db
      .select({ maks: sql<number | null>`max(${incomingLetters.agendaNo})` })
      .from(incomingLetters);
    return Number(row?.maks ?? 0) + 1;
  }, 1);
}

export async function nextAgendaOutgoing() {
  return aman(async () => {
    const [row] = await db
      .select({ maks: sql<number | null>`max(${outgoingLetters.agendaNo})` })
      .from(outgoingLetters);
    return Number(row?.maks ?? 0) + 1;
  }, 1);
}

export async function countOutgoingThisYear() {
  return aman(async () => {
    const tahun = new Date().getFullYear();
    const [row] = await db
      .select({ jumlah: sql<number>`count(*)::int` })
      .from(outgoingLetters)
      .where(sql`extract(year from ${outgoingLetters.letterDate}) = ${tahun}`);
    return row?.jumlah ?? 0;
  }, 0);
}

export type DashboardData = {
  totalMasuk: number;
  totalKeluar: number;
  disposisiPending: number;
  disposisiSelesai: number;
  suratMasukBulanIni: number;
  belumDidisposisi: number;
  terbaru: {
    jenis: "masuk" | "keluar";
    nomor: string;
    perihal: string;
    pihak: string;
    tanggal: string | null;
    status: string;
  }[];
  grafik: { label: string; masuk: number; keluar: number; disposisi: number }[];
};

export async function getDashboardData(pengguna?: PenggunaAktif | null): Promise<DashboardData> {
  const [masuk, keluar, disp] = await Promise.all([
    listIncomingLetters(),
    listOutgoingLetters(),
    listDispositions(pengguna),
  ]);

  const sekarang = new Date();
  const awalBulan = new Date(sekarang.getFullYear(), sekarang.getMonth(), 1);

  const suratMasukBulanIni = masuk.filter(
    (item) => new Date(item.receivedDate) >= awalBulan,
  ).length;

  const belumDidisposisi = masuk.filter(
    (item) => item.dispositionStatus !== "Sudah",
  ).length;

  // Grafik 6 bulan terakhir
  const grafik: DashboardData["grafik"] = [];
  for (let geser = 5; geser >= 0; geser -= 1) {
    const acuan = new Date(sekarang.getFullYear(), sekarang.getMonth() - geser, 1);
    const akhir = new Date(sekarang.getFullYear(), sekarang.getMonth() - geser + 1, 1);
    const dalam = (nilai: string | Date) => {
      const tanggal = new Date(nilai);
      return tanggal >= acuan && tanggal < akhir;
    };
    grafik.push({
      label: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(acuan),
      masuk: masuk.filter((item) => dalam(item.receivedDate)).length,
      keluar: keluar.filter((item) => dalam(item.letterDate)).length,
      disposisi: disp.filter((item) => dalam(item.dispositionDate)).length,
    });
  }

  const terbaru = [
    ...masuk.slice(0, 4).map((item) => ({
      jenis: "masuk" as const,
      nomor: item.letterNumber,
      perihal: item.subject,
      pihak: item.sender,
      tanggal: item.receivedDate,
      status: item.dispositionStatus === "Sudah" ? "Sudah" : "Belum",
    })),
    ...keluar.slice(0, 4).map((item) => ({
      jenis: "keluar" as const,
      nomor: item.officialNumber,
      perihal: item.subject,
      pihak: item.recipient,
      tanggal: item.letterDate,
      status: item.archiveStatus,
    })),
  ]
    .sort((a, b) => new Date(b.tanggal ?? 0).getTime() - new Date(a.tanggal ?? 0).getTime())
    .slice(0, 5);

  return {
    totalMasuk: masuk.length,
    totalKeluar: keluar.length,
    disposisiPending: disp.filter((item) => item.followUpStatus === "Pending").length,
    disposisiSelesai: disp.filter((item) => item.followUpStatus === "Selesai").length,
    suratMasukBulanIni,
    belumDidisposisi,
    terbaru,
    grafik,
  };
}

export { aman as safeQuery };
