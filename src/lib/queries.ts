import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  classifications,
  dispositions,
  incomingLetters,
  outgoingLetters,
  staff,
} from "@/db/schema";


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

export async function countPendingDispositions() {
  return aman(async () => {
    const [row] = await db
      .select({ jumlah: sql<number>`count(*)::int` })
      .from(dispositions)
      .where(eq(dispositions.followUpStatus, "Pending"));
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

export async function listDispositions() {
  return aman(
    () => db.select().from(dispositions).orderBy(desc(dispositions.createdAt)).limit(200),
    [] as DispositionRow[],
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

export async function getDashboardData(): Promise<DashboardData> {
  const [masuk, keluar, disp, klass] = await Promise.all([
    listIncomingLetters(),
    listOutgoingLetters(),
    listDispositions(),
    listClassifications(),
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
