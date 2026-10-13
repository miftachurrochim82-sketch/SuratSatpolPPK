# e-Surat — Satpol PP & Damkar Kabupaten Trenggalek

Aplikasi administrasi surat: pencatatan surat masuk, surat keluar, disposisi, arsip dokumen, dan verifikasi keaslian surat digital lewat QR code.

## Teknologi

| Bagian | Dipakai |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Bahasa | TypeScript 5.9 |
| Database | PostgreSQL + Drizzle ORM |
| Styling | Tailwind CSS 4 |
| QR code | `qrcode` |

## Struktur Project

```
.
├── app/                          # Next.js App Router
│   ├── (admin)/                  # halaman admin (memakai sidebar + topbar)
│   │   ├── page.tsx              # dashboard
│   │   ├── surat-masuk/page.tsx
│   │   ├── surat-keluar/page.tsx
│   │   ├── disposisi/page.tsx
│   │   ├── klasifikasi/page.tsx  # kode klasifikasi surat
│   │   ├── pegawai/page.tsx      # penerima disposisi
│   │   └── pengaturan/page.tsx   # identitas instansi
│   ├── api/
│   │   ├── health/route.ts       # health check koneksi database
│   │   ├── qr/route.ts           # generator QR code (PNG)
│   │   └── lampiran/[id]/route.ts# pengunduh lampiran surat
│   ├── verifikasi/page.tsx       # portal verifikasi publik
│   ├── globals.css               # design system (148 kelas CSS)
│   └── layout.tsx                # root layout
├── src/
│   ├── actions/                  # server actions (simpan/ubah/hapus)
│   │   ├── letters.ts            # surat masuk & keluar
│   │   ├── dispositions.ts       # disposisi
│   │   └── master.ts             # klasifikasi, pegawai, pengaturan
│   ├── components/               # komponen React
│   │   ├── AppShell.tsx          # kerangka sidebar + topbar
│   │   ├── FormModal.tsx         # formulir dalam modal
│   │   ├── TableFilter.tsx       # pencarian & filter tabel
│   │   ├── DetailModal.tsx       # rincian berkas
│   │   ├── QrModal.tsx           # tampilan QR + salin tautan
│   │   ├── FileField.tsx         # unggah lampiran (base64)
│   │   ├── DispositionPrint.tsx  # cetak lembar disposisi
│   │   ├── PrintPortal.tsx       # penempatan blok cetak
│   │   └── Icons.tsx             # ikon SVG sebaris
│   ├── lib/
│   │   ├── queries.ts            # pembacaan data dari database
│   │   ├── settings.ts           # pengaturan instansi
│   │   ├── format.ts             # format tanggal & teks
│   │   ├── ids.ts                # nomor agenda, kode verifikasi
│   │   └── action-state.ts       # tipe hasil server action
│   └── db/
│       ├── index.ts              # koneksi pool PostgreSQL + Drizzle
│       └── schema.ts             # definisi 7 tabel
├── scripts/seed.mjs              # pengisi data contoh
├── drizzle/                      # file migrasi SQL (hasil db:generate)
├── .env.example                  # template variabel lingkungan
└── drizzle.config.ts             # konfigurasi Drizzle Kit
```

## Prasyarat

- Node.js 20 atau lebih baru
- PostgreSQL 14 atau lebih baru

## Cara Menjalankan

### 1. Install dependency

```bash
npm install
```

### 2. Siapkan database

Buat database kosong, contoh:

```bash
createdb app_db
```

Lalu salin template env dan sesuaikan koneksinya:

```bash
cp .env.example .env
```

Isi `DATABASE_URL` di file `.env`, formatnya:

```
postgresql://USER:PASSWORD@HOST:PORT/NAMA_DATABASE
```

### 3. Buat tabel di database

```bash
npm run db:migrate
```

Perintah ini menjalankan migrasi yang ada di folder `drizzle/` sehingga ke-7 tabel terbentuk.

### 3b. Isi data contoh (opsional)

```bash
npm run db:seed
```

Menambahkan pengaturan instansi, 6 klasifikasi, 5 pegawai, 9 surat masuk, 8 surat keluar,
dan 3 disposisi contoh — supaya halaman tidak tampil kosong saat pertama dibuka.
Aman dijalankan berulang kali; data yang sudah ada tidak akan tertimpa.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Buka http://localhost:3000

## Daftar Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan server development |
| `npm run build` | Build untuk produksi |
| `npm run start` | Jalankan hasil build produksi |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm run lint` | Cek kualitas kode dengan ESLint |
| `npm run db:generate` | Buat file migrasi baru setelah `schema.ts` diubah |
| `npm run db:migrate` | Terapkan migrasi ke database |
| `npm run db:push` | Dorong skema langsung tanpa file migrasi (khusus development) |
| `npm run db:studio` | Buka GUI Drizzle Studio untuk melihat isi tabel |
| `npm run db:seed` | Isi basis data dengan data contoh |

## Skema Database

| Tabel | Isi |
|---|---|
| `attachments` | Lampiran berkas (disimpan sebagai base64) |
| `staff` | Data pegawai/petugas penerima disposisi |
| `classifications` | Kode klasifikasi surat |
| `app_settings` | Pengaturan aplikasi (nama instansi, wilayah, dll) |
| `incoming_letters` | Surat masuk |
| `outgoing_letters` | Surat keluar + kode verifikasi QR |
| `dispositions` | Disposisi surat masuk ke pegawai |

## Alur Verifikasi Surat

1. Surat keluar dicatat di `outgoing_letters` dan mendapat `verificationCode` unik.
2. Kode itu dicetak sebagai QR code pada surat.
3. Tombol **QR** pada tabel surat keluar menampilkan QR code yang dibuat oleh `/api/qr`.
4. Pihak penerima memindai QR → diarahkan ke `/verifikasi?code=...`.
5. Halaman menampilkan status **DOKUMEN TERDAFTAR & VALID** atau **DOKUMEN TIDAK DITEMUKAN**.
   Kode juga bisa diketik manual pada kolom pencarian di halaman itu.

## Catatan Keamanan

- File `.env` **tidak boleh** di-commit — sudah diblokir `.gitignore`.
- Kredensial database tidak lagi ditulis di `drizzle.config.ts`, melainkan dibaca dari `DATABASE_URL`.
- **Halaman admin belum dilindungi login.** Sebelum dipasang di jaringan kantor, tambahkan
  autentikasi dan pembatasan peran agar tidak semua orang bisa mengubah data surat.
- Lampiran tersimpan di dalam basis data sebagai base64, sehingga berkas cadangan basis data
  sekaligus memuat seluruh dokumen surat.

## Fitur

### Surat Masuk
- Pencatatan dengan nomor agenda otomatis
- Unggah lampiran scan surat (maksimal 2 MB, disimpan sebagai base64)
- Tingkat keamanan: Biasa, Terbatas, Rahasia, Sangat Rahasia
- Pencarian dan filter berdasarkan klasifikasi

### Surat Keluar
- Nomor resmi otomatis berformat `005/SATPOL-PPK/X/2026`
- Kode verifikasi unik 8 karakter (tanpa huruf/angka yang mudah tertukar)
- QR code siap cetak, bisa dibuka, disalin tautannya, atau diunduh
- Status arsip: Draft, Ditandatangani, Terkirim, Diarsipkan

### Disposisi
- Kartu disposisi dengan instruksi dan batas waktu
- Penanda otomatis bila melewati tenggat
- Penerusan ke pegawai lewat tautan `wa.me` dengan pesan terisi
- Cetak lembar disposisi ukuran A4 (tombol Cetak)

### Data Master
- Klasifikasi surat, lengkap dengan usulan kode yang sering dipakai
- Data pegawai, nomor WhatsApp otomatis dinormalkan ke format `62…`
- Identitas instansi yang dipakai pada kop, nomor surat, dan portal verifikasi

## Status Pengembangan

- [x] Struktur project & konfigurasi
- [x] Skema database 7 tabel + migrasi
- [x] Dashboard admin
- [x] Halaman surat masuk
- [x] Halaman surat keluar + QR code
- [x] Halaman disposisi + cetak
- [x] Master data (klasifikasi, pegawai, pengaturan)
- [x] Portal verifikasi dokumen publik
- [x] API health check
- [x] Skrip data contoh
- [ ] Autentikasi pengguna & pembatasan peran
- [ ] Integrasi pengiriman WhatsApp otomatis lewat gateway
