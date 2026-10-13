# Uji antarmuka e-Surat

Dua skrip di folder ini memeriksa aplikasi yang sedang berjalan lewat peramban
sungguhan (Chromium). Keduanya **tidak** memakai pustaka uji tambahan di
`package.json` — cukup `playwright-core` yang dipasang sekali di luar repo.

## Persiapan

```bash
# 1. basis data & aplikasi
sudo pg_ctlcluster 17 main start        # sekali per sesi mesin
npm install
npm run db:migrate
npm run db:seed

# 2. jalankan aplikasi (mode produksi; `next dev` tidak dipakai untuk uji ini)
npx next build
npx next start -p 3100 -H 0.0.0.0 &

# 3. peramban untuk uji (di luar repo, agar tidak menambah dependensi aplikasi)
cd /tmp && npm i playwright-core && npx playwright-core install chromium
npx playwright-core install-deps chromium   # sekali per mesin (butuh sudo)
```

## Menjalankan

```bash
node scripts/uji/uji-app.mjs     # 18 pemeriksaan fungsi & tata letak
node scripts/uji/uji-akses.mjs      # 12 pemeriksaan aksesibilitas & semantik
```

Alamat aplikasi bisa diubah: `BASE=http://127.0.0.1:3000 node scripts/uji/uji-app.mjs`.
Bila Chromium tidak ada di lokasi bawaan Playwright, tunjuk berkasnya:
`CHROME=/path/ke/chrome node scripts/uji/uji-app.mjs`.

Akun bawaan hasil `db:seed`: `admin` / `Admin#2026` (administrator), `tu` / `Tu#2026`,
`pimpinan` / `Pimpinan#2026`, `petugas` / `Petugas#2026`.

## Apa yang diperiksa

| Berkas | Isi |
|---|---|
| `uji-app.mjs` | verifikasi 5 keadaan, tautan pintar kartu dashboard, panel notifikasi, pencarian/urutan/perangkap fokus tabel, paginasi + keadaan di alamat halaman, tiga daftar kartu (disposisi/pegawai/pengguna), saringan dari alamat, cetak disposisi (nama berkas + QR), tata letak ponsel, sasaran sentuh 44px, laci menu |
| `uji-akses.mjs` | `lang` & judul, satu h1 per halaman tanpa lompatan level, penanda wilayah, nama aksesibel setiap kendali, id ganda/alt/label/`scope`, `aria-current`, `aria-live`, `role=alert` pada galat login, penanda fokus saat Tab, fokus panel notifikasi, semantik modal, halaman Login |

Uji ini melengkapi pemeriksaan gaya dan semantik berkas pratinjau
(`periksa-gaya.py`, `sensus-pemicu.mjs`, `uji-terima.mjs`) yang ada di folder
`alat/uji/` pada ruang kerja pengembangan. Hasil terakhir semuanya tercatat di
[`AUDIT-UI-UX.md`](../../AUDIT-UI-UX.md).

## Catatan

* Skrip mengubah data (menambah/menghapus berkas saat menguji tombol). Jalankan
  pada basis data contoh, bukan basis data produksi.
* Beberapa pemeriksaan menyesuaikan diri dengan isi data contoh — misalnya saringan
  status akun diuji dengan "Nonaktif" karena semua akun bawaan berstatus Aktif.
