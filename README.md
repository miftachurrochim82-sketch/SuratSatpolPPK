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
├── app/                        # Next.js App Router
│   ├── api/health/route.ts     # health check koneksi database
│   ├── globals.css             # design system (147 kelas CSS)
│   ├── layout.tsx              # root layout
│   └── page.tsx                # portal verifikasi dokumen
├── src/db/
│   ├── index.ts                # koneksi pool PostgreSQL + Drizzle
│   └── schema.ts               # definisi 7 tabel
├── drizzle/                    # file migrasi SQL (hasil db:generate)
├── .env.example                # template variabel lingkungan
└── drizzle.config.ts           # konfigurasi Drizzle Kit
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
3. Pihak penerima memindai QR → diarahkan ke halaman `/` dengan parameter `?code=...`.
4. Halaman menampilkan status **DOKUMEN TERDAFTAR & VALID** atau **DOKUMEN TIDAK DITEMUKAN**.

## Catatan Keamanan

- File `.env` **tidak boleh** di-commit — sudah diblokir `.gitignore`.
- Kredensial database tidak lagi ditulis di `drizzle.config.ts`, melainkan dibaca dari `DATABASE_URL`.

## Status Pengembangan

- [x] Struktur project & konfigurasi
- [x] Skema database 7 tabel + migrasi
- [x] Portal verifikasi dokumen
- [x] API health check
- [ ] Dashboard admin
- [ ] Halaman surat masuk
- [ ] Halaman surat keluar
- [ ] Halaman disposisi
- [ ] Master data (klasifikasi, pegawai, pengaturan)
- [ ] Integrasi pengiriman WhatsApp
