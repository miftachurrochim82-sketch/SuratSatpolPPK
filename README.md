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
│   │   └── pengguna/page.tsx     # akun petugas & hak akses
│   ├── api/
│   │   ├── health/route.ts       # health check koneksi database
│   │   ├── qr/route.ts           # generator QR code (PNG)
│   │   └── lampiran/[id]/route.ts# pengunduh lampiran surat
│   ├── login/page.tsx            # halaman masuk (di luar kerangka admin)
│   ├── verifikasi/page.tsx       # portal verifikasi publik
│   ├── globals.css               # design system (148 kelas CSS)
│   └── layout.tsx                # root layout
├── src/
│   ├── actions/                  # server actions (simpan/ubah/hapus)
│   │   ├── auth.ts               # masuk, keluar, ubah kata sandi
│   │   ├── letters.ts            # surat masuk & keluar
│   │   ├── dispositions.ts       # disposisi
│   │   ├── master.ts             # klasifikasi, pegawai, pengaturan
│   │   └── users.ts              # pengelolaan akun (khusus administrator)
│   ├── components/               # komponen React
│   │   ├── AppShell.tsx          # kerangka sidebar + topbar
│   │   ├── FormModal.tsx         # formulir dalam modal
│   │   ├── TableFilter.tsx       # pencarian & filter tabel
│   │   ├── DetailModal.tsx       # rincian berkas
│   │   ├── QrModal.tsx           # tampilan QR + salin tautan
│   │   ├── FileField.tsx         # unggah lampiran (base64)
│   │   ├── DispositionPrint.tsx  # cetak lembar disposisi
│   │   ├── PrintPortal.tsx       # penempatan blok cetak
│   │   ├── LoginForm.tsx         # formulir masuk
│   │   └── Icons.tsx             # ikon SVG sebaris
│   ├── lib/
│   │   ├── auth.ts               # hash sandi, sesi, pemeriksaan izin
│   │   ├── permissions.ts        # definisi peran & hak akses
│   │   ├── queries.ts            # pembacaan data dari database
│   │   ├── settings.ts           # pengaturan instansi
│   │   ├── format.ts             # format tanggal & teks
│   │   ├── ids.ts                # nomor agenda, kode verifikasi
│   │   └── action-state.ts       # tipe hasil server action
│   └── db/
│       ├── index.ts              # koneksi pool PostgreSQL + Drizzle
│       └── schema.ts             # definisi 9 tabel
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
3 disposisi contoh, dan 4 akun pengguna — supaya halaman tidak tampil kosong saat pertama
dibuka. Aman dijalankan berulang kali; data yang sudah ada tidak akan tertimpa.

Setelah selesai, skrip akan menampilkan daftar **akun bawaan**:

| Peran | Nama pengguna | Kata sandi |
|---|---|---|
| Administrator | `admin` | `Admin#2026` |
| Tata Usaha | `tu` | `Tu#2026` |
| Pimpinan | `pimpinan` | `Pimpinan#2026` |
| Pegawai | `petugas` | `Petugas#2026` |

> **Ganti kata sandi ini sebelum dipakai sungguhan.** Caranya: masuk lewat `/login`, buka
> halaman **Pengaturan → Ubah Kata Sandi**. Akun contoh yang tidak dipakai sebaiknya
> dinonaktifkan atau dihapus di halaman **Pengguna Sistem**.

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
- Halaman admin sudah dilindungi login dan pembatasan peran. Untuk pemakaian di jaringan
  kantor, sebaiknya tambahkan HTTPS agar cookie sesi terkirim secara terenkripsi
  (`secure` otomatis aktif saat `NODE_ENV=production`).
- Ganti seluruh kata sandi bawaan dari data contoh sebelum aplikasi dipakai.
- Lampiran tersimpan di dalam basis data sebagai base64, sehingga berkas cadangan basis data
  sekaligus memuat seluruh dokumen surat.

## Fitur

### Autentikasi & Hak Akses
- Halaman masuk di `/login`; seluruh halaman admin dialihkan ke sana bila belum masuk
- Sesi disimpan pada cookie `httpOnly` berumur 7 hari; token disimpan dalam bentuk hash SHA-256
- Kata sandi disimpan sebagai **hash scrypt** dengan garam per akun, dibandingkan memakai
  `timingSafeEqual` supaya tidak bocor lewat selisih waktu
- Empat peran dengan hak akses berbeda (lihat tabel di bawah)
- Tombol yang tidak diizinkan tidak dirender, **dan** setiap server action memeriksa izinnya
  sendiri karena action dapat dipanggil langsung tanpa lewat antarmuka
- Administrator terakhir tidak dapat dihapus atau diturunkan perannya
- Mengubah peran atau status akun langsung menghapus sesi aktif pengguna tersebut

### Sidebar Lipat
- Tombol di kiri atas topbar untuk menyempitkan sidebar menjadi mode ikon (78 piksel)
- Pilihan lebar disimpan di `localStorage`, jadi bertahan saat halaman dibuka kembali
- Saat menyempit, nama menu muncul sebagai tooltip dan penanda disposisi tetap terlihat
- Di bawah 820 piksel, sidebar otomatis berubah menjadi laci layar kecil

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

## Peran dan Hak Akses

| Kemampuan | Administrator | Tata Usaha | Pimpinan | Pegawai |
|---|:---:|:---:|:---:|:---:|
| Melihat dashboard & daftar surat | ✅ | ✅ | ✅ | ✅ |
| Mencatat surat masuk | ✅ | ✅ | — | — |
| Mencatat surat keluar | ✅ | ✅ | — | — |
| Membuat disposisi | ✅ | ✅ | ✅ | — |
| Mengubah data master (klasifikasi, pegawai) | ✅ | — | — | — |
| Mengubah pengaturan instansi | ✅ | — | — | — |
| Menghapus data | ✅ | — | — | — |
| Mengelola akun pengguna | ✅ | — | — | — |
| Cakupan data | semua | semua | semua | disposisi sendiri |

Peran **Pegawai** perlu ditautkan ke satu baris di tabel `staff` agar dapat melihat disposisi
yang ditujukan kepadanya. Tautan itu diatur saat membuat akun di halaman Pengguna Sistem.

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
- [x] Autentikasi pengguna & pembatasan peran
- [x] Sidebar dapat dilipat
- [ ] Integrasi pengiriman WhatsApp otomatis lewat gateway
- [ ] Ganti kata sandi wajib pada masuk pertama
- [ ] Log aktivitas (siapa mengubah apa dan kapan)
