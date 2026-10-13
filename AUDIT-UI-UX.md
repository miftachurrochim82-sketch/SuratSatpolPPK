# Audit UI/UX — e-Surat Satpol PP & Damkar Trenggalek

> Berkas ini adalah laporan audit yang dihasilkan dari pemeriksaan terukur terhadap
> aplikasi ini. Cara mengulang pengukurannya ada di bagian "Cara memeriksa ulang".
> Skrip uji aplikasi ikut disertakan di `scripts/uji/`; alat pembuat pratinjau dan
> pemeriksa gaya berada di ruang kerja pengembangan (folder `alat/`).


Diperiksa 13 Oktober 2026, lalu dikerjakan sampai tuntas. Semua angka di bawah
**hasil pengukuran**, bukan perkiraan.

## Status sekarang — seluruh butir audit sudah ditutup

| Kelompok | Jumlah butir | Status | Bukti |
|---|---|---|---|
| P0 (warna, huruf, fokus, layar kecil) | 5 | ✅ diterapkan di aplikasi **dan** pratinjau | `periksa-gaya.py`: kontras gagal **0**, huruf ≤11px **0**, `:focus-visible` 16 aturan |
| P1 (skala huruf, sasaran sentuh, tabel ponsel, perangkap fokus) | 5 | ✅ diterapkan & diuji peramban | `uji-app.mjs` 18/18 · `uji-terima.mjs` 24/24 |
| P2 (tautan pintar, paginasi, panel notifikasi, tanggal, istilah, jarak, keadaan kosong, cetak, bilah pratinjau) | 9 | ✅ diterapkan | bagian "Putaran keempat" di bawah |
| Temuan susulan (pencarian salah cocok, saringan kartu, kesetaraan pratinjau) | 7 | ✅ diperbaiki | bagian "Putaran ketiga" di bawah |
| **Aksesibilitas & semantik** (baru diukur di putaran kelima) | 12 pemeriksaan | ✅ bersih di aplikasi **dan** pratinjau | `uji-akses.mjs` 12/12 · `periksa-gaya.py` bagian "semantik: bersih" |

Rincian tiap putaran ada di bagian bawah dokumen; yang paling akhir adalah yang berlaku.

## Ringkasan dalam satu menit

| # | Temuan | Angka terukur | Tingkat |
|---|---|---|---|
| 1 | Huruf terlalu kecil untuk aplikasi kantor | **91 dari 115** deklarasi huruf ≤ 11px (79%) | P0 |
| 2 | Teks abu-abu gagal kontras WCAG AA | **73 warna teks** di bawah 4,5:1; terburuk 1,78:1 | P0 |
| 3 | Informasi hilang di layar kecil | saringan klasifikasi, lencana status, lonceng → `display:none` | P0 |
| 4 | Penanda fokus papan ketik nyaris tidak ada | hanya **4** aturan `:focus-visible` | P0 |
| 5 | Kolom isian 11px memicu iOS memperbesar halaman | seluruh input | P0 |
| 6 | Sasaran sentuh kecil | tombol ikon 27×27px, tutup modal 30×30px | P1 |
| 7 | Tabel 8 kolom harus di-scroll mendatar di ponsel | `min-width: 820px` | P1 |
| 8 | Modal belum mengurung fokus | `Tab` bisa keluar dari modal | P1 |
| 9 | Tidak menghormati "kurangi animasi" | 0 aturan `prefers-reduced-motion` | P1 |

**P0 = sudah saya siapkan dan uji.** Perbaikannya nol risiko tata letak (hanya warna,
indikator fokus, dan visibilitas elemen), dan sudah lulus 16/16 uji penerimaan.
**P1–P2 = usulan**, perlu sekali pemeriksaan visual karena mengubah ukuran/posisi.

Anda bisa membandingkan sendiri: buka `pratinjau-usulan.html` (sudah memakai seluruh
perbaikan P0) berdampingan dengan `pratinjau-tampilan.html`.

---

## Hasil penerapan — 13 Oktober 2026

Seluruh saran sudah dikerjakan, lalu diukur ulang. Angka di bawah berasal dari
pengukuran di peramban sungguhan (Chromium headless), bukan perkiraan.

### Keterbacaan

| Pemeriksaan | Sebelum | Sesudah |
|---|---|---|
| Deklarasi huruf ≤ 11px di CSS | **91 dari 115** (79%) | **0 dari 129** |
| Elemen ter-render dengan teks ≤ 11px (9 halaman, 3 ukuran layar) | 85 (dashboard) … 7 (verifikasi) | **0 di semua halaman** |
| Warna teks gagal kontras AA | **73** | **0** |
| Generasi huruf terpakai | 9–11px mendominasi | 12, 13, 14, 15, 16, 18, 19, 20, 22, 25, 26px |

### Layar kecil

| Pemeriksaan | Sebelum | Sesudah |
|---|---|---|
| Tabel 8 kolom di ponsel | geser mendatar, kolom Perihal–Aksi tersembunyi | **kartu**, Perihal di paling atas, tanpa geser |
| Saringan klasifikasi di ponsel | disembunyikan | tampil |
| Lencana status di "Surat Terbaru" | disembunyikan | tampil |
| Lonceng pemberitahuan (<480px) | disembunyikan | tampil |
| Laci menu ponsel | **tidak ada** — pengguna ponsel tidak bisa membuka sidebar | ada: tombol menu, latar gelap, tutup dengan Esc / memilih menu |
| Kolom isian | 11px (iOS memperbesar halaman) | 16px di bawah 821px |
| Sasaran sentuh di ponsel | banyak 27–37px | umumnya ≥44px; lencana status 32px |

### Kemudahan pakai

| Pemeriksaan | Sebelum | Sesudah |
|---|---|---|
| Jumlah hasil pencarian | tidak ada | "Menampilkan 1 dari 6 berkas" + tombol bersihkan |
| Cakupan pencarian | nomor, pengirim, perihal | + kode klasifikasi, tanggal, status |
| Sortir kolom | tidak ada | klik judul **Agenda** / **Diterima** (naik–turun) |
| Saringan status disposisi | tidak ada | Semua / Pending / Selesai + jumlah |
| Panel pemberitahuan | lonceng langsung melompat halaman | panel berisi disposisi yang perlu tindakan |
| Kartu ringkasan | hanya pindah halaman | membawa saringan: "Belum Didisposisi" → Surat Masuk tersaring |
| Perangkap fokus modal | Tab bisa lolos ke halaman belakang | Tab berputar di dalam modal |
| Keadaan kosong pada kartu | tidak ada | ada, dengan ajakan tindakan |
| Kolom Aksi pada layar lebar | terpotong di kanan | menempel di tepi kanan, selalu terlihat |
| Fokus papan ketik | 4 aturan | 15 aturan |
| Kurangi animasi | diabaikan | dihormati (`prefers-reduced-motion`) |
| Keseragaman angka | "9 berkas" padahal datanya 6 | semua angka dihitung dari data |

### Berkas yang berubah

- `SuratSatpolPPK/app/globals.css` — palet teks, skala huruf, tinggi kontrol,
  tabel menjadi kartu, laci ponsel, fokus, reduced-motion (~90 baris ditambah).
- `SuratSatpolPPK/app/(admin)/surat-masuk/page.tsx` dan `surat-keluar/page.tsx` —
  atribut `data-label` pada setiap sel (sumber label mode kartu).
- `SuratSatpolPPK/app/login/page.tsx` — dua ukuran huruf 10px → 12/13px.
- `alat/_konten.py`, `alat/_form.py`, `alat/_skrip.js`, `alat/buat-pratinjau.py` —
  markup & interaksi pratinjau.

### Bukti

| Uji | Hasil |
|---|---|
| Uji penerimaan pratinjau (`uji-terima.mjs`) | **22/22 lulus** |
| Sensus pemicu (`sensus-pemicu.mjs`) | 156 diuji, **semua merespons** (10 hilang karena uji hapus, 6 di dalam panel/modal) |
| Pemeriksa gaya (`periksa-gaya.py`) | 0 kontras gagal, 0 huruf ≤11px, 15 aturan fokus, reduced-motion aktif |
| Gerbang build aplikasi | `tsc --noEmit` ✓, `eslint .` ✓, `next build` ✓ (14 rute) |
| Aplikasi asli di peramban (`/login`, `/verifikasi`) | 200, **0 teks ≤11px**, 0 luapan mendatar |

### Yang belum dikerjakan (jujur)

1. **Sortir, saringan status, dan panel notifikasi baru ada di pratinjau.** Untuk
   masuk ke aplikasi asli perlu komponen klien dan penyimpanan kata kunci di URL.
2. **Paginasi** belum ada; karena data contoh hanya 6 berkas, belum terasa perlu.
   Tambahkan bila arsip sudah lewat 20–25 baris.
3. **Kepala tabel yang menempel saat menggulir** tidak dipakai — di ponsel tabel
   sudah menjadi kartu, jadi tidak lagi perlu.
4. **Lencana status 32px**, bukan 44px seperti kontrol lain. Itu pilihan sadar agar
   kartu tidak terlihat penuh; sudah melewati ambang minimum WCAG (24px).
5. **Bilah "PRATINJAU"** masih ada di berkas contoh. Untuk presentasi ke pimpinan,
   bilah itu bisa dimatikan.


---

## Putaran kedua — 13 Oktober 2026

### `/verifikasi` diperbaiki

**Masalah asal:** satu keadaan untuk dua sebab berbeda. Ketika basis data mati, halaman
menampilkan **"DOKUMEN TIDAK DITEMUKAN"** sekaligus **"sistem tidak dapat dihubungi"** —
dua pernyataan yang saling bertentangan, dan yang pertama menuduh surat warga tidak sah
padahal sistemnya yang bermasalah.

Sekarang ada empat keadaan yang saling terpisah:

| Keadaan | Pesan | Warna |
|---|---|---|
| Belum ada kode | MASUKKAN KODE VERIFIKASI | abu netral |
| Kode terdaftar | DOKUMEN TERDAFTAR & VALID + rincian surat | hijau |
| Kode tidak terdaftar | DOKUMEN TIDAK DITEMUKAN + kode yang dicari + petunjuk format | merah |
| Basis data mati | SISTEM VERIFIKASI SEDANG GANGGUAN + tombol **Coba periksa lagi** | kuning |

Perbaikan lain pada halaman ini:
- Penyebab kegagalan basis data kini **dicatat ke log server** (`console.error`) —
  sebelumnya `catch` kosong sehingga admin tidak punya jejak apa pun.
- Kode dinormalkan: spasi/tanda dibuang, huruf kecil dijadikan besar
  (`k7m2 p9qx` → `K7M2P9QX` tetap ditemukan).
- Kode lebih pendek memakai huruf/angka yang mudah tertukar (O, I, 0, 1).
- Pesan memuat kode yang dicari sehingga warga bisa memeriksa salah ketik.
- `role="status" aria-live="polite"` supaya pembaca layar membacakan hasilnya.
- Kotak kode: `autoCapitalize`, `spellCheck` mati, fokus otomatis saat kosong.
- Cacat tata letak diperbaiki: tombol "Periksa" tadinya **menumpuk** kotak kode
  (`.search-field` tanpa `min-width: 0`); sekarang berjarak di 390/820/1440px.

### Aplikasi asli disamakan dengan pratinjau

| Tambahan | Berkas |
|---|---|
| Jumlah hasil pencarian + tombol bersihkan | `src/components/TableFilter.tsx` |
| Sortir kolom lewat klik judul (Agenda, Diterima/Tanggal) | `TableFilter.tsx`, `surat-masuk`, `surat-keluar` |
| Perangkap fokus + kunci gulir + fokus kembali ke pemicu | `src/lib/fokus.ts` baru, dipakai `DetailModal`, `FormModal`, `QrModal` |
| Format tanggal seragam (sub-label tidak lagi panjang) | `surat-masuk/page.tsx` |

### Basis data akhirnya diuji sungguhan

PostgreSQL 17 dipasang di sandbox, `db:migrate` dan `db:seed` dijalankan:

- 9 tabel terbentuk, isi: **9 surat masuk, 8 surat keluar, 5 disposisi, 4 pengguna**.
- Ini pertama kalinya skema dan `scripts/seed.mjs` diverifikasi — sebelumnya hanya
  diperiksa sintaksnya karena belum pernah ada basis data.

### Uji di peramban sungguhan (aplikasi asli)

| Uji | Hasil |
|---|---|
| `/verifikasi` 5 keadaan (kosong, valid, tidak ditemukan, format salah, huruf kecil + spasi) | **5/5 benar** |
| Basis data dimatikan lalu dihidupkan | pesan "gangguan" muncul, lalu pulih ke "valid" |
| Pencarian + jumlah hasil + tombol bersihkan | 9 → "Menampilkan 1 dari 9 berkas" → 9 |
| Sortir agenda & tanggal (naik/turun) | urutan benar, `aria-sort` benar |
| Modal: Tab 12× tidak keluar, gulir terkunci, Esc mengembalikan fokus | lulus |
| Tampilan ponsel aplikasi: kartu, label, tanpa geser mendatar, laci menu | lulus |
| Gerbang build | `tsc` ✓ `eslint` ✓ `next build` ✓ |
| Pratinjau: uji penerimaan + sensus pemicu | 22/22 lulus, 156 pemicu merespons |

### Masih terbuka — semuanya sudah ditutup di putaran keempat

1. ~~Sortir, jumlah hasil, dan saringan status belum masuk aplikasi asli untuk halaman
   kartu~~ → selesai (`GridFilter` untuk disposisi/pegawai/pengguna, lihat "Putaran ketiga").
2. ~~Paginasi~~ → selesai: penggaris halaman di kedua tabel surat, pratinjau dan aplikasi.
3. ~~Penyimpanan kata kunci pencarian di URL~~ → selesai: kata kunci, saringan, urutan kolom,
   ukuran baris, dan nomor halaman semuanya hidup di alamat halaman.

---

## P0 — sudah diterapkan di `pratinjau-usulan.html` dan diverifikasi

Hasil `python3 alat/uji/periksa-gaya.py` sebelum → sesudah:

| Pemeriksaan | Sebelum | Sesudah |
|---|---|---|
| Warna teks gagal AA (< 4,5:1) | **73** | **0** |
| Aturan `:focus-visible` | 4 | 15 |
| `prefers-reduced-motion` | 0 | 1 |
| Saringan klasifikasi di ponsel | disembunyikan | tampil |
| Lencana status di "Surat Terbaru" (≤820px) | disembunyikan | tampil |
| Lonceng pemberitahuan (≤480px) | disembunyikan | tampil |
| Ukuran huruf kolom isian di ponsel | 11px | 16px |

Cara kerjanya ada di `alat/usulan-gaya.py`: tiap warna teks yang gagal digelapkan
lewat ruang warna HSL — **rona tetap, hanya kecerahannya turun** — sampai lulus 4,6:1
di atas semua latar terang yang dipakai (putih, tabel, kartu biru, kartu kuning).
Jadi tampilannya tetap biru-navy-krem yang sama, hanya lebih terbaca.

Bukti tidak ada yang rusak: **16/16 uji penerimaan lulus**, dan sensus 167 pemicu
menghasilkan tepat 7 "tidak merespons" yang sama seperti versi lama — ketujuhnya sudah
dibuktikan bukan cacat (halaman tujuan sama dengan halaman asal, dan `select` yang
memang memakai event `change`, bukan klik).

---

## P1 — perbaikan tata letak

> **Status: kelima butir di bawah sudah diterapkan dan diuji di peramban**
> (peramban sungguhan, Chromium). Angka "Sekarang" pada tabel-tabel ini adalah keadaan
> **sebelum** perbaikan, dan sudah tidak berlaku lagi — lihat bagian "Hasil penerapan"
> serta "Putaran kedua/ketiga/keempat" untuk keadaan sesudahnya.

### 1. Naikkan skala huruf — ini perbaikan terbesar berikutnya
79% deklarasi huruf di aplikasi ini 9–11px. Untuk staf yang bekerja 6–8 jam sehari,
membaca nomor surat 11px sambil mencocokkan berkas fisik adalah beban nyata.

| Dipakai untuk | Sekarang | Usulan |
|---|---|---|
| Label kolom tabel | 9px | 12px |
| Teks bantu di dalam sel | 9px | 12px |
| Keterangan kartu (`.disp-line span`, `.staff-info span`) | 9px | 12px |
| Isi tabel, tombol kecil, tautan | 11px | 13px |
| Label kolom isian | 10px | 13px |
| Judul panel (`h3`) | 12px | 15px |
| Judul modal | 17px | 18px |
| Teks isi dasar (`body`) | 14px | 15px |

Ikutannya: tinggi baris tabel naik dari ~48px ke ~56px dan `.recent-row` dari 59px ke
66px. Itu **sehat** (memperbesar jarak klik). Sesudah diterapkan, tidak ada teks yang
terpotong — diperiksa dengan mengukur tinggi baris dan potret layar pada tiga lebar
(1440px, 820px, 390px). Bukti angka: `periksa-gaya.py` melaporkan **0 dari 141**
deklarasi huruf yang ≤ 11px (sebelumnya 91 dari 115).

### 2. Sasaran sentuh
`row-icon` dan `mini-button` 27px, tutup modal 30px, tombol keluar sidebar 28px.
Pada layar sentuh, naikkan ke **40px** (idealnya 44px) dan beri jarak antar tombol ≥ 8px.
Karena kolom Aksi berisi 3 tombol, ini sekaligus mendorong penggunaan kartu di ponsel.

### 3. Tabel di layar kecil
Tabel surat punya 8 kolom dengan `min-width: 820px`, jadi di ponsel pengguna harus
menggeser mendatar untuk sampai ke tombol aksi. Dua pilihan:
- **Cepat:** `thead` menempel di atas (`position: sticky`), kolom pertama (agenda) dan
  kolom Aksi tetap terlihat, tombol aksi diperbesar.
- **Lebih baik:** di bawah 820px setiap baris menjadi kartu — nomor agenda + perihal di
  atas, pengirim/tanggal kecil di bawah, tombol Detail/QR/hapus di baris terakhir.
  Tidak ada lagi geser mendatar.

### 4. Modal belum mengurung fokus
Sudah ada `Esc` dan fokus kembali ke tombol pemicu — bagus. Yang belum: `Tab` masih
bisa keluar dari modal ke halaman di belakangnya, dan latar tidak `inert`. Dampaknya
pengguna keyboard bisa "hilang" di balik lapisan gelap. Perbaikannya ± 15 baris di
`alat/_skrip.js` (`keydown` Tab → putar fokus di dalam `.modal`).

### 5. Pencarian tabel — **selesai, dan diperluas**
Sekarang: hitungan hasil hidup ("Menampilkan 4 dari 9 berkas"), tombol **Bersihkan**,
cakupan mencakup kode klasifikasi dan tanggal, saringan status disposisi, pengurutan
lewat klik judul kolom, dan **paginasi**. Seluruh keadaan itu tersimpan di alamat
halaman sehingga hasil saringan bisa disalin atau dibagikan.

---

## P2 — pemolesan pengalaman

1. **Tautan pintar**: kartu "Belum Didisposisi" sebaiknya membuka Surat Masuk dengan
   saringan *Belum* sudah terpasang, bukan halaman penuh.
2. **Sortir & halaman**: klik judul kolom untuk mengurutkan (tanggal terbaru sebagai
   bawaan) dan paginasi bila berkas lewat 20 baris.
3. **Panel notifikasi**: lonceng langsung melompat ke halaman Disposisi; lebih enak bila
   membuka panel kecil berisi 3 disposisi terakhir + tautan "lihat semua".
4. **Format tanggal**: saat ini bercampur "13 Okt 2026" dan "06 Oktober 2026" — pilih satu.
5. **Istilah**: "Catat Surat Masuk" (tombol), "Rekam Surat Masuk" (judul modal),
   "Daftar Surat Masuk" (judul panel). Samakan agar pengguna tidak bertanya-tanya.
6. **Ritme jarak**: padding panel bervariasi 17–22px. Samakan ke kelipatan 4/8px.
7. **Pesan kosong untuk kartu**: Disposisi dan Pegawai belum punya empty state seperti
   tabel — tambahkan agar konsisten saat hasil saring kosong.
8. **Cetak**: arsitektur lembar disposisi sudah tepat. Tambahan kecil: nama berkas
   otomatis (`Disposisi-005-1240-2026.pdf`) dan pilihan menyalakan cetak QR tanda tangan.
9. **Bilah "PRATINJAU"** di atas berguna saat menilai; sembunyikan saat dipakai presentasi
   ke pimpinan.

---

## Yang sudah baik — jangan diubah

- **Navigasi memakai menu aplikasi**: sidebar, ikon topbar, dan tautan di dalam halaman.
  Tidak ada lagi bilah tombol mengambang.
- **Status selalu teks + warna** (`Belum`, `Terkirim`, `Cuti`) — aman untuk buta warna,
  bukan mengandalkan warna saja.
- **Semua 167 tombol sudah berfungsi**, lencana status pun bisa diklik ke rincian.
- **Modal rincian seragam** untuk surat masuk, keluar, disposisi, klasifikasi, pegawai,
  dan akun — pengguna belajar satu pola saja.
- **Sidebar lipat 78px** dengan label muncul saat disempitkan; di ponsel menjadi
  laci dengan latar gelap dan tombol tutup.
- **Arsitektur cetak**: hanya lembar disposisi A4 yang tercetak, sisanya disembunyikan.
- **Login & Verifikasi adalah render server asli**, bukan tiruan — dan sudah diberi
  keterangan di bilah atas.

---

## Cara memeriksa ulang

```bash
cd /home/user
python3 alat/ambil-nyata.py                     # ambil isi Login & Verifikasi dari server hidup
python3 alat/buat-pratinjau.py                  # bangun pratinjau biasa
python3 alat/usulan-gaya.py                     # hasilkan CSS usulan
ESURAT_CSS=alat/globals-usulan.css \
ESURAT_KELUARAN=/home/user/pratinjau-usulan.html \
  python3 alat/buat-pratinjau.py                # bangun pratinjau usulan

python3 alat/uji/periksa-gaya.py                # kontras, huruf, fokus, target sentuh
cp alat/uji/*.mjs /tmp/ && cd /tmp && npm i jsdom playwright-core
node sensus-pemicu.mjs                          # tekan semua pemicu di pratinjau
BERKAS=/home/user/pratinjau-tampilan.html node uji-terima.mjs  # 24 uji penerimaan
BASE=http://127.0.0.1:3100 node uji-app.mjs      # 18 pemeriksaan aplikasi asli di Chromium
```

### Batas kejujuran

Uji di atas memakai `jsdom`, yang menjalankan JavaScript tetapi **tidak menghitung tata
letak**. Jadi P0 (warna, fokus, visibilitas, ukuran huruf isian) aman dan sudah terbukti;
sedangkan usulan P1 yang mengubah ukuran — terutama skala huruf dan tabel kartu — tetap
perlu Anda lihat sendiri di peramban sebelum dikunci.

## Penerapan ke aplikasi asli

Seluruh P0 berasal dari `app/globals.css`, jadi perbaikan yang sama bisa langsung
diterapkan ke aplikasi Next.js (bukan hanya pratinjau), lalu diuji dengan gerbang build
yang sudah ada:

```bash
cd SuratSatpolPPK && npx tsc --noEmit && npx eslint . && npx next build
```

## Putaran ketiga — pencarian yang salah cocok, saringan kartu, dan kesetaraan pratinjau

Setelah gerbang hijau, ditemukan satu cacat yang tidak terlihat dari uji klik: **pencarian
mencocokkan isi kendali, bukan isi data**.

### Temuan

| # | Temuan | Bukti sebelum | Sesudah |
|---|--------|---------------|---------|
| 1 | Di halaman Pengguna, setiap kartu memuat daftar pilihan peran (`<select>` berisi Administrator/Tata Usaha/Pimpinan/Pegawai). Akibatnya kata kunci "admin" cocok ke **semua** kartu. | cari "admin" → 4 dari 4 akun; cari "pimpinan" → 3 dari 4 akun | "admin" → **1 dari 4**; "pimpinan" → **1 dari 4** |
| 2 | Saringan status kartu **tidak pernah** jalan di halaman pratinjau untuk pegawai & pengguna: tombol kartu tidak punya atribut status. | tidak ada `data-status` pada kartu | 9 kartu ber-atribut status (7 Aktif, 1 Cuti, 1 Nonaktif) |
| 3 | Di kartu pengguna ada **dua** lencana (peran lebih dulu, status kedua), sedangkan penyaring membaca lencana pertama. | saring "Aktif" → 0 tampak | saring "Aktif" → 3 · "Nonaktif" → 1 |
| 4 | Di pratinjau, kartu disposisi juga belum punya `data-status`, jadi saringan Pending/Selesai diam saja. | saring "Selesai" → 0 tampak | "Pending" → 2 · "Selesai" → 1 |
| 5 | Menonaktifkan akun di pratinjau hanya mengubah lencana, tidak memperbarui atribut status — saringan berikutnya jadi salah. | — | atribut status ikut diperbarui, saringan dihitung ulang |
| 6 | Halaman pegawai & pengguna di pratinjau **belum punya** kotak pencarian sama sekali, sehingga tidak setara dengan aplikasi. | tidak ada `[data-cari]` | pencarian + pembersih + saringan status + penghitung hasil, sama seperti aplikasi |
| 7 | Data contoh pratinjau memakai status kepegawaian "Cuti" sebagai status akun, padahal saringan akun menawarkan Aktif/Nonaktif. | "Cuti" tak ada di daftar pilihan | akun Budi Santoso = **Nonaktif** (sejalan dengan pilihannya) |

### Perbaikan

* `src/components/GridFilter.tsx` dan `src/components/TableFilter.tsx` — teks untuk pencocokan
  dibersihkan lebih dulu: isi `select`, `option`, `button`, `script`, `style` dibuang, hasilnya
  diingat di `WeakMap` agar tidak dihitung berulang setiap ketikan.
* `src/components/GridFilter.tsx` — bila kartu punya atribut status, atribut itu yang dipakai;
  teks lencana hanya menjadi cadangan. Ini membuat kartu dengan dua lencana tetap benar.
* `alat/buat-pratinjau.py`, `alat/_konten.py`, `alat/_skrip.js` — perlakuan yang sama untuk
  pratinjau: kartu diberi status yang benar, halaman pegawai & pengguna diberi bilah pencarian,
  dan penghitung hasil (`jumlah-grid-pegawai`, `jumlah-grid-pengguna`) mengikuti pilihan.
* `app/globals.css` — tombol pembersih bawaan peramban pada `input[type="search"]`
  (tanda ✕ kecil di ujung kanan) disembunyikan, karena kotak pencarian sudah punya tombol
  pembersih sendiri; sebelumnya kedua tanda ✕ tampil berdampingan saat kotak terisi.

### Bukti sesudah perbaikan

```
Pratinjau (peramban Chromium, 1440×950)
  pegawai   kartu=5  opsi=[Aktif,Cuti]        Aktif→4 · Cuti→1        "Menampilkan 4 dari 5 pegawai"
  pengguna  kartu=4  opsi=[Aktif,Nonaktif]    Aktif→3 · Nonaktif→1    "Menampilkan 1 dari 4 akun"
  disposisi kartu=3  opsi=[Pending,Selesai]   Pending→2 · Selesai→1   "Menampilkan 1 dari 3 disposisi"
  pencarian khas: "Rina"→1/4 · "Damkar"→1/5 · "19870924"→1/5 · tanpa hasil → pesan kosong tampil

Aplikasi asli (basis data hidup)
  /pengguna  cari "admin" → 1 dari 4 akun (sebelumnya 4 dari 4)
  /disposisi cari "Dewi"  → 1 dari 5 · status "Pending" → 4 dari 5
  /pegawai   cari "Damkar"→ 1 dari 5 · status "Aktif"  → 4 dari 5
  /surat-masuk cari "Inspektorat" → "Menampilkan 1 dari 9 berkas", bersihkan → "9 berkas",
               sortir agenda 009→001 lalu 001→009, modal mengurung fokus, Esc mengembalikan fokus

Gerbang mutu
  periksa-gaya.py (pratinjau-tampilan.html) : huruf ≤11px 0/130 · kontras <4,5:1 = 0 ·
                                             :focus-visible 15 aturan · kontrol terpendek 34px
  uji-terima.mjs                            : 22/22 lulus
  sensus-pemicu.mjs                         : 158 diuji, 7 dilewati (tersembunyi), semua merespons
  aplikasi: tsc ✓ · eslint ✓ · next build ✓ · verifikasi 5/5 · ponsel 390×844 tanpa geser mendatar
```

### Pelajaran

Pencarian yang hanya membaca `textContent` akan “menelan” label kendali di dalam baris atau
kartu. Pembersihan teks sekali di awal — dan memakai atribut data bila ada — jauh lebih tahan
lama daripada menambal kata kunci satu per satu.

## Putaran keempat — menutup sisa butir audit

Semua butir yang masih terbuka pada putaran sebelumnya dikerjakan pada aplikasi asli,
lalu pratinjau disamakan supaya tetap bisa dipakai untuk melihat hasilnya tanpa basis data.

### Yang dikerjakan

| Butir | Sebelum | Sesudah |
|---|---|---|
| P2.1 Tautan pintar | Kartu ringkasan dashboard hanya teks, klik tidak membawa saringan | Setiap kartu adalah tautan: "Belum Didisposisi" → `/surat-masuk?disposisi=Belum`, "Disposisi Pending" → `/disposisi?status=Pending` — daftar di tujuan langsung tersaring |
| P2.2 Paginasi | Seluruh baris tabel selalu tampil (9 baris) | Penggaris halaman di kedua tabel surat: pilihan 5/10/25/50/Semua, tombol Sebelumnya–Berikutnya, hitungan rentang "Menampilkan 6–9 dari 9 berkas", langsung aktif sejak dibuka |
| P2.3 Panel notifikasi | Lonceng langsung pindah ke halaman Disposisi | Lonceng membuka panel berisi 3 disposisi terbaru yang menunggu + tautan "Lihat semua disposisi pending"; tutup dengan Esc, klik di luar, atau tombol ✕ |
| P2.4 Format tanggal | Bercampur "13 Okt 2026" dan "06 Oktober 2026" | Panjang penuh hanya di dalam rincian & lembar cetak; semua sub-label memakai bentuk pendek yang sama |
| P2.5 Istilah | "Catat" dan "Rekam" dipakai bergantian | Satu istilah: **Catat Surat Masuk / Catat Surat Keluar** pada tombol, judul modal, dan judul panel |
| P2.6 Ritme jarak | Padding wadah 17–25px bercampur | 30 deklarasi diseragamkan ke kelipatan 4px (12/16/20/24px) |
| P2.7 Keadaan kosong kartu | Disposisi & Pegawai tidak punya pesan saat hasil saring kosong | `.empty-grid` tampil di ketiga daftar kartu, termasuk pratinjau |
| P2.8 Cetak | Hanya lembar disposisi | Nama berkas otomatis (`Disposisi-005-1234-35-07-302-2026`) saat menyimpan PDF, plus sakelar **QR** yang menambahkan QR ringkasan di tengah lembar cetak |
| P2.9 Bilah PRATINJAU | Selalu tampil | Ada tombol ✕ untuk menyembunyikannya sebelum presentasi |
| Saringan dari alamat | Hanya pencarian tabel | Kata kunci, saringan (klasifikasi/status disposisi/status kartu), urutan kolom, ukuran baris, dan nomor halaman semuanya tersimpan di alamat — bisa disalin, dikirim, dan tahan muat ulang |
| Saringan surat masuk | Hanya klasifikasi | Ditambah saringan **status disposisi** (Belum / Sudah) |
| Sasaran sentuh di perangkat sentuh | 27–34px | Semua kendali yang sering disentuh menjadi **44px** pada perangkat sentuh (`@media (hover: none), (pointer: coarse)`) |

### Di mana perubahannya

| Berkas | Isi |
|---|---|
| `src/lib/urlstate.ts` (baru) | Membaca/menulis keadaan saringan di alamat halaman lewat `useSyncExternalStore` — aman untuk hidrasi, tanpa `setState` di dalam effect |
| `src/components/TableFilter.tsx` | Ditulis ulang: beberapa saringan sekaligus, penggaris halaman, urutan lewat alamat, rentang hasil |
| `src/components/GridFilter.tsx` | Keadaan pindah ke alamat halaman; hasil saringan kartu kini bisa dibagikan |
| `src/components/AppShell.tsx` | Panel notifikasi (isi, tautan, Esc, klik di luar) |
| `src/lib/queries.ts`, `app/(admin)/layout.tsx` | `listPendingDispositions` → 3 disposisi terbaru untuk panel |
| `app/(admin)/page.tsx` | Kartu ringkasan menjadi tautan bersaringan |
| `src/components/DispositionPrint.tsx`, `app/api/qr/route.ts` | Nama berkas otomatis, sakelar QR, `?text=` untuk QR ringkasan |
| `app/(admin)/surat-masuk/page.tsx` | Saringan status disposisi + atribut barisnya |
| `app/globals.css` | Gaya penggaris halaman, panel notifikasi, tombol cetak, kode cetak QR, ritme jarak, sasaran sentuh 44px |
| `alat/_skrip.js`, `alat/_konten.py`, `alat/buat-pratinjau.py` | Pratinjau disamakan: paginasi, panel notifikasi, bilah dapat ditutup, keadaan kosong kartu |
| `alat/ambil-nyata.py` (baru) | Isi Login & Verifikasi diambil dari server hidup — pembuatan pratinjau kini bisa diulang penuh dari repo |

### Bukti

```
Pratinjau (Chromium + jsdom)
  uji penerimaan          24/24 lulus (termasuk paginasi & bilah dapat ditutup)
  sensus pemicu           158 diuji, 8 dilewati (tersembunyi), SEMUA merespons
  periksa-gaya.py         huruf <=11px 0/141 · kontras <4,5:1 = 0 · :focus-visible 16 aturan
  paginasi                6 baris · ukuran 5 -> 5 lalu 1 baris · "Menampilkan 6–6 dari 6 berkas"

Aplikasi asli (Chromium 1440x950 + 390x844, basis data hidup) — 18/18 lulus
  kartu dashboard         Surat Masuk->/surat-masuk · Disposisi Pending->/disposisi?status=Pending
  saringan dari alamat    ?disposisi=Belum -> Belum=4 Sudah=0 · "Menampilkan 4 dari 9 berkas"
  panel notifikasi        3 item · tautan /disposisi?status=Pending · Esc menutup
  pencarian tabel         "9 berkas" -> "Menampilkan 1 dari 9 berkas" -> bersihkan
  urutan kolom            naik 1,2,3… lalu turun 9,8,7… ; aria-sort ikut berubah
  modal                   fokus tetap di dalam, body.overflow=hidden, Esc mengembalikan fokus
  paginasi                hal.1 5 baris "Menampilkan 1–5 dari 9 berkas" · hal.2 4 baris · Halaman 2 dari 2
  alamat halaman          ?ukuran=5&hal=2 · muat ulang tetap di halaman 2 · ?cari=Inspektorat tetap terisi
  kartu (3 halaman)       jelas tersaring: Dewi 1/5 · Damkar 1/5 · Rina 1/4 · keadaan kosong tampil
  cetak disposisi         berkas "Disposisi-005-1234-35-07-302-2026" · QR /api/qr?text=… 200 image/png
  verifikasi              5/5 keadaan benar (kode nyata dari basis data)
  ponsel 390x844          tabel menjadi kartu, tanpa geser mendatar, laci menu buka-tutup,
                          sasaran sentuh terpendek 44px (22 kendali diperiksa)
  gerbang build           npx tsc --noEmit ✓ · npx eslint . ✓ · npx next build ✓
```

### Catatan kejujuran

* Isi pratinjau untuk Login & Verifikasi berasal dari render server sungguhan, tetapi
  disimpan sebagai HTML statis: formulirnya berfungsi di pratinjau, sedangkan pemeriksaan
  keaslian yang sebenarnya tetap hanya ada di aplikasi.
* Panel notifikasi memakai 3 disposisi terbaru yang menunggu; jumlahnya pada lonceng tetap
  berasal dari hitungan basis data yang sama, jadi keduanya tidak bisa berbeda.
* Ukuran 44px diterapkan pada perangkat sentuh saja — di desktop tombol tetap lebih rapat
  supaya tabel 8 kolom tidak melebar berlebihan.

## Putaran kelima — aksesibilitas & semantik

Dimensi ini sebelumnya belum pernah diukur: audit putaran pertama menilai warna, ukuran huruf,
dan sasaran sentuh, tetapi tidak memeriksa apakah aplikasinya bisa dipakai dengan pembaca layar
atau papan ketik saja. Diukur dengan `alat/uji/uji-akses.mjs` (Chromium, 12 pemeriksaan) dan
pemeriksaan semantik statis di `alat/uji/periksa-gaya.py`.

### Temuan dan perbaikan

| # | Temuan | Bukti sebelum | Sesudah |
|---|---|---|---|
| 1 | Lompatan hierarki judul: halaman memiliki `h1` lalu langsung `h3` (judul panel), sedangkan judul kartu memakai `h4` | urutan judul `13` | judul panel → `h2`, judul kartu → `h3`; urutan `12` di 8 halaman |
| 2 | Sel kepala tabel tanpa `scope` | 8 `th` di tiap tabel surat | 8 `th` di kedua tabel memakai `scope="col"` |
| 3 | Saringan (`select` di dalam label) tidak punya penanda fokus karena `outline: none` ditulis inline | 2 dari 26 perhentian Tab tanpa penanda | 26 dari 26 punya penanda (`:focus-within` + `:focus-visible` pada pembungkus) |
| 4 | Panel notifikasi berperan `dialog` tetapi fokus tetap di lonceng saat dibuka | fokus di panel = **false** | fokus pindah ke tombol tutup; Esc/klik di luar mengembalikannya ke lonceng |
| 5 | Blok CSS `.notif-panel` versi lama masih tertinggal (dua definisi, salah satunya tidak terpakai) | 2 definisi `.notif-panel` | definisi lama dihapus, tinggal satu |

### Hasil akhir pengukuran

```
Aplikasi asli — uji-akses.mjs 12/12 lulus
  bahasa & judul        lang=id · judul "e-Surat | Satpol PP & Damkar Trenggalek"
  hierarki judul        1 h1 per halaman · urutan 12 (tanpa lompatan)
  wilayah               header=1 main=1 nav=3 aside=1
  nama aksesibel        8 halaman tanpa kendali tanpa nama
  id/alt/label/scope    bersih di 8 halaman
  aria-current          menu aktif ditandai di setiap halaman
  aria-live             /surat-masuk:2 /surat-keluar:2 /disposisi:1 /pegawai:1 /pengguna:1
  galat login           diumumkan lewat role=alert ("Nama pengguna atau kata sandi salah.")
  fokus papan ketik     26 perhentian, 0 tanpa penanda
  panel notifikasi      peran=dialog · fokus masuk panel · Esc → kembali ke lonceng
  modal rincian         aria-modal=true · diberi nama · fokus kembali ke pemicu
  halaman Login         lang=id · 1 h1 · semua isian berlabel

Pratinjau — periksa-gaya.py
  semantik              15 tampilan diperiksa · bersih
  kontras gagal 0 · huruf <=11px 0/138 · :focus-visible 17 aturan
  uji penerimaan        25/25 lulus (termasuk fokus panel notifikasi)
  sensus pemicu         158 diuji, semua merespons
```

### Catatan tentang alat ukur

Dua kegagalan awal ternyata cacat alat ukur, bukan cacat aplikasi, dan sudah diperbaiki supaya
laporan berikutnya tidak salah lagi:

* **Isian tersembunyi** (`type="hidden"`, termasuk yang disuntikkan Next.js seperti
  `$ACTION_REF_1`) ikut dihitung sebagai "kendali tanpa nama". Semua isian tersembunyi kini
  dikecualikan.
* **Pemeriksaan modal** menunjuk `.modal` (kotak isinya), padahal peran `dialog` dan
  `aria-modal` ada di pembungkus `.modal-layer`. Alat kini memeriksa elemen yang benar.

Satu temuan lagi muncul khusus di pratinjau: berkas pratinjau memuat banyak halaman sekaligus,
jadi "satu h1 per halaman" hanya bermakna bila dihitung **per tampilan**. Alat kini memecah
berkas menjadi 15 tampilan (10 halaman admin, 4 keadaan verifikasi, 1 lembar cetak).
