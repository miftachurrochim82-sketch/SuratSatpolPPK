#!/usr/bin/env node
/**
 * Mengisi basis data dengan data contoh supaya aplikasi tidak tampil kosong
 * saat pertama kali dibuka.
 *
 * Jalankan:  npm run db:seed
 * Prasyarat: tabel sudah dibuat (npm run db:migrate)
 *
 * Skrip ini aman dijalankan berulang kali — semua penulisan memakai
 * ON CONFLICT DO NOTHING sehingga data yang sudah ada tidak tertimpa.
 */

import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL belum diatur. Salin .env.example menjadi .env lalu isi koneksinya.");
  process.exit(1);
}

const pool = new Pool({ connectionString });

/** yyyy-mm-dd */
function tanggal(geserHari = 0) {
  const d = new Date();
  d.setDate(d.getDate() + geserHari);
  return d.toISOString().slice(0, 10);
}

function id(prefix, urut) {
  return `${prefix}-SEED-${String(urut).padStart(3, "0")}`;
}

/** Sama dengan hashPassword() di src/lib/auth.ts: scrypt$<salt>$<kunci> */
function hashPassword(sandi) {
  const garam = randomBytes(16).toString("hex");
  const kunci = scryptSync(sandi, garam, 64).toString("hex");
  return `scrypt$${garam}$${kunci}`;
}

const KODE_VERIFIKASI = [
  "K7M2P9QX", "R4T8WN3B", "Y6H2JD5M", "P3Q9XK7T",
  "B8N4VC2R", "M5W7ZP4H", "T2G9KR6N", "X7D3QM8V",
  "H6P4NB9S", "N9S2TX5G", "V4M8KC3J", "L2R7WY6P",
];

const PENGATURAN = [
  ["institution_name", "SATPOL PP DAN PEMADAM KEBAKARAN"],
  ["institution_area", "KABUPATEN TRENGGALEK"],
  ["institution_address", "Jl. Merdeka No. 1, Trenggalek, Jawa Timur 66311"],
  ["institution_phone", "(0355) 791234"],
  ["institution_email", "satpolpp@trenggalekkab.go.id"],
  ["head_name", "Drs. H. Bambang Setiawan, M.Si."],
  ["head_position", "Kepala Satpol PP dan Damkar"],
  ["letter_code", "SATPOL-PPK"],
  ["wa_gateway_url", ""],
];

const KLASIFIKASI = [
  ["HM.01", "Undangan", "Surat undangan rapat, kegiatan, atau upacara."],
  ["HM.02", "Permohonan", "Permintaan bantuan, data, atau personel."],
  ["HM.03", "Pemberitahuan", "Informasi kegiatan atau kebijakan baru."],
  ["HM.04", "Laporan", "Laporan hasil kegiatan atau kejadian."],
  ["HM.05", "Nota Dinas", "Komunikasi internal antar bidang."],
  ["HM.06", "Surat Tugas", "Penugasan pegawai untuk kegiatan tertentu."],
];

/**
 * Akun bawaan. WAJIB diganti setelah pemasangan pertama —
 * lihat catatan di akhir keluaran skrip ini.
 */
const AKUN = [
  ["US-SEED-001", "admin", "Administrator Sistem", "Admin#2026", "admin", null],
  ["US-SEED-002", "tu", "Rina Wulandari", "Tu#2026", "tu", null],
  ["US-SEED-003", "pimpinan", "Drs. H. Bambang Setiawan, M.Si.", "Pimpinan#2026", "pimpinan", null],
  ["US-SEED-004", "petugas", "Budi Santoso, S.E.", "Petugas#2026", "pegawai", "PG-SEED-001"],
];

const PEGAWAI = [
  ["PG-SEED-001", "19850312 201001 1 003", "Budi Santoso, S.E.", "Kasi Penegakan Perda", "628123456701", "Aktif"],
  ["PG-SEED-002", "19870924 201101 1 005", "Siti Nurhaliza, S.Sos.", "Kasi Trantibum", "628123456702", "Aktif"],
  ["PG-SEED-003", "19910218 201501 2 004", "Agus Prasetyo, S.H.", "Kasi Damkar", "628123456703", "Aktif"],
  ["PG-SEED-004", "19930507 201801 2 006", "Dewi Kartika, S.Kom.", "Bendahara Pengeluaran", "628123456704", "Cuti"],
  ["PG-SEED-005", "19881130 201001 1 008", "Rahmat Hidayat", "Petugas Operasional", null, "Aktif"],
];

const SURAT_MASUK = [
  ["005/1234/35.07.302/2026", 45, "Bagian Organisasi Setda", "HM.01", "Undangan rapat koordinasi penertiban PKL", "Biasa"],
  ["005/1235/35.07.302/2026", 30, "Satpol PP Provinsi Jawa Timur", "HM.03", "Pemberitahuan jadwal apel gabungan satuan", "Biasa"],
  ["005/1236/35.07.302/2026", 21, "Bagian Hukum Setda", "HM.02", "Permohonan data penegakan Perda tahun 2026", "Terbatas"],
  ["005/1237/35.07.302/2026", 14, "Camat Trenggalek", "HM.02", "Permohonan bantuan personel pengamanan pasar", "Biasa"],
  ["005/1238/35.07.302/2026", 9, "Polres Trenggalek", "HM.03", "Pemberitahuan pengamanan kegiatan pilkades", "Terbatas"],
  ["005/1239/35.07.302/2026", 5, "BPBD Kabupaten Trenggalek", "HM.03", "Informasi peringatan dini cuaca ekstrem", "Biasa"],
  ["005/1240/35.07.302/2026", 3, "Inspektorat Daerah", "HM.04", "Laporan hasil pemeriksaan internal bidang umum", "Terbatas"],
  ["005/1241/35.07.302/2026", 1, "Dinas Perhubungan", "HM.02", "Permintaan personel rekayasa lalu lintas", "Biasa"],
  ["005/1242/35.07.302/2026", 0, "Sekretariat Daerah", "HM.05", "Nota dinas usulan penambahan armada damkar", "Biasa"],
];

const SURAT_KELUAR = [
  ["005/1234/35.07.302/2026", 48, "Bagian Organisasi Setda", "HM.01", "Undangan rapat koordinasi penertiban PKL", "Draft"],
  ["005/1235/35.07.302/2026", 33, "Camat Trenggalek", "HM.03", "Pemberitahuan jadwal patroli gabungan wilayah kota", "Terkirim"],
  ["005/1236/35.07.302/2026", 24, "Bagian Hukum Setda", "HM.02", "Permohonan data penegakan Perda tahun 2026", "Terkirim"],
  ["005/1237/35.07.302/2026", 17, "Polres Trenggalek", "HM.02", "Permohonan bantuan personel pengamanan pasar", "Terkirim"],
  ["005/1238/35.07.302/2026", 11, "BPBD Kabupaten Trenggalek", "HM.03", "Pemberitahuan pengamanan kegiatan pilkades", "Diarsipkan"],
  ["005/1239/35.07.302/2026", 6, "Inspektorat Daerah", "HM.04", "Laporan hasil pemeriksaan internal bidang umum", "Terkirim"],
  ["005/1240/35.07.302/2026", 4, "Dinas Perhubungan", "HM.02", "Permohonan personel rekayasa lalu lintas", "Diarsipkan"],
  ["005/1241/35.07.302/2026", 2, "RSUD Dr. Soedomo", "HM.06", "Surat tugas pendampingan evakuasi kebakaran", "Ditandatangani"],
];

async function main() {
  const client = await pool.connect();
  let berhasil = 0;
  let dilewati = 0;

  try {
    await client.query("BEGIN");

    // --- pengaturan ---
    for (const [key, value] of PENGATURAN) {
      const hasil = await client.query(
        `INSERT INTO app_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO NOTHING`,
        [key, value],
      );
      hasil.rowCount ? (berhasil += 1) : (dilewati += 1);
    }

    // --- klasifikasi ---
    for (const [code, name, description] of KLASIFIKASI) {
      const hasil = await client.query(
        `INSERT INTO classifications (code, name, description) VALUES ($1, $2, $3)
         ON CONFLICT (code) DO NOTHING`,
        [code, name, description],
      );
      hasil.rowCount ? (berhasil += 1) : (dilewati += 1);
    }

    // --- pegawai ---
    for (const [sid, nip, name, position, wa, status] of PEGAWAI) {
      const hasil = await client.query(
        `INSERT INTO staff (id, employee_number, name, position, whatsapp, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [sid, nip, name, position, wa, status],
      );
      hasil.rowCount ? (berhasil += 1) : (dilewati += 1);
    }

    // --- akun pengguna ---
    for (const [uid, username, name, sandi, role, staffId] of AKUN) {
      const hasil = await client.query(
        `INSERT INTO users (id, username, name, password_hash, role, staff_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'Aktif')
         ON CONFLICT (id) DO NOTHING`,
        [uid, username, name, hashPassword(sandi), role, staffId],
      );
      hasil.rowCount ? (berhasil += 1) : (dilewati += 1);
    }

    // --- surat masuk ---
    let agenda = 1;
    const idSuratMasuk = [];
    for (const [nomor, geser, pengirim, kode, perihal, sifat] of SURAT_MASUK) {
      const sid = id("SM", agenda);
      idSuratMasuk.push(sid);
      const hasil = await client.query(
        `INSERT INTO incoming_letters
           (id, agenda_no, letter_number, letter_date, received_date, sender, subject,
            classification_code, security_level, disposition_status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Belum', 'Admin TU')
         ON CONFLICT (id) DO NOTHING`,
        [sid, agenda, nomor, tanggal(geser), tanggal(geser + 1), pengirim, perihal, kode, sifat],
      );
      hasil.rowCount ? (berhasil += 1) : (dilewati += 1);
      agenda += 1;
    }

    // --- surat keluar ---
    agenda = 1;
    for (const [nomor, geser, tujuan, kode, perihal, status] of SURAT_KELUAR) {
      const sid = id("SK", agenda);
      const hasil = await client.query(
        `INSERT INTO outgoing_letters
           (id, agenda_no, official_number, letter_date, recipient, subject,
            classification_code, signer, verification_code, archive_status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Admin TU')
         ON CONFLICT (id) DO NOTHING`,
        [
          sid,
          agenda,
          nomor,
          tanggal(geser),
          tujuan,
          perihal,
          kode,
          "Drs. H. Bambang Setiawan, M.Si.",
          KODE_VERIFIKASI[agenda - 1] ?? `SEED${agenda}`,
          status,
        ],
      );
      hasil.rowCount ? (berhasil += 1) : (dilewati += 1);
      agenda += 1;
    }

    // --- disposisi ---
    const DISPOSISI = [
      [0, 0, "Untuk ditindaklanjuti", "Koordinasikan dengan bidang terkait sebelum batas waktu.", -7, 5],
      [1, 1, "Untuk dilaksanakan", "Siapkan personel sesuai jadwal apel gabungan.", -4, 3],
      [2, 2, "Mohon pendapat dan arahan", "Pelajari permintaan data sebelum dijawab.", -2, 4],
      [3, 0, "Untuk ditindaklanjuti", "Koordinasikan pengamanan dengan Polsek setempat.", -1, 2],
      [5, 3, "Untuk dilaksanakan", "Pastikan peralatan damkar siap siaga.", 0, 6],
    ];

    let nomorDisposisi = 1;
    for (const [suratIdx, pegawaiIdx, instruksi, catatan, geserDisp, geserDue] of DISPOSISI) {
      const sid = id("SM", suratIdx + 1);
      const pid = PEGAWAI[pegawaiIdx][0];
      const namaPegawai = PEGAWAI[pegawaiIdx][2];
      const waPegawai = PEGAWAI[pegawaiIdx][4];
      const nomorSurat = SURAT_MASUK[suratIdx][0];
      const perihalSurat = SURAT_MASUK[suratIdx][4];
      const did = `DP-SEED-${String(nomorDisposisi).padStart(3, "0")}`;

      const hasil = await client.query(
        `INSERT INTO dispositions
           (id, incoming_letter_id, letter_number, subject, disposition_date, due_date,
            instruction, leader_note, staff_id, staff_name, whatsapp, whatsapp_status,
            follow_up_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO NOTHING`,
        [
          did,
          sid,
          nomorSurat,
          perihalSurat,
          tanggal(geserDisp),
          tanggal(geserDue),
          instruksi,
          catatan,
          pid,
          namaPegawai,
          waPegawai,
          waPegawai ? "Siap Dikirim" : "Tidak Ada Nomor",
          nomorDisposisi === 5 ? "Selesai" : "Pending",
        ],
      );
      hasil.rowCount ? (berhasil += 1) : (dilewati += 1);

      // tandai suratnya sudah didisposisikan
      await client.query(
        `UPDATE incoming_letters SET disposition_status = 'Sudah' WHERE id = $1`,
        [sid],
      );

      nomorDisposisi += 1;
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("\nGagal mengisi data contoh:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }

  console.log(`\nSelesai. ${berhasil} baris ditambahkan, ${dilewati} dilewati (sudah ada).`);
  console.log("Buka aplikasi lalu lihat halaman Dashboard untuk memeriksa hasilnya.");

  if (berhasil > 0) {
    console.log("");
    console.log("================================================================");
    console.log("  AKUN BAWAAN — SEGERA GANTI KATA SANDINYA");
    console.log("================================================================");
    console.log("  Peran        Nama pengguna   Kata sandi");
    console.log("  -----------  --------------  --------------");
    console.log("  Admin        admin           Admin#2026");
    console.log("  Tata Usaha   tu              Tu#2026");
    console.log("  Pimpinan     pimpinan        Pimpinan#2026");
    console.log("  Pegawai      petugas         Petugas#2026");
    console.log("----------------------------------------------------------------");
    console.log("  Masuk lewat /login, lalu ubah kata sandi di halaman Pengaturan.");
    console.log("  Hapus atau nonaktifkan akun contoh ini sebelum dipakai sungguhan.");
    console.log("================================================================");
  }
}

main();
