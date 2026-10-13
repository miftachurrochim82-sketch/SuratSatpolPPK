/* Uji aplikasi e-Surat lewat peramban sungguhan (Chromium).
 *
 * Berkas ini menggabungkan pemeriksaan UI/UX yang sudah pernah lulus supaya
 * tidak perlu disusun ulang setiap sesi:
 *   A. Verifikasi surat: 5 keadaan (netral, valid, tidak ditemukan, format salah, spasi)
 *   B. Tabel surat masuk: hitungan, pencarian, pembersih, urutan, perangkap fokus modal
 *   C. Daftar kartu: disposisi, pegawai, pengguna (pencarian, saringan, keadaan kosong)
 *   D. Ponsel: tabel menjadi kartu, tanpa geser mendatar, laci menu
 *   E. Hasil putaran keempat: tautan pintar, panel notifikasi, paginasi, alamat halaman,
 *      cetak disposisi (nama berkas + QR), sasaran sentuh
 *
 * Pemakaian:
 *   node alat/uji/uji-app.mjs            (server harus hidup di 127.0.0.1:3100)
 *   BASE=http://127.0.0.1:3000 node alat/uji/uji-app.mjs
 */
import { execFileSync } from "node:child_process";
import { chromium } from "playwright-core";

const EXE = process.env.CHROME; // kosong = pakai Chromium bawaan playwright-core
const BASE = process.env.BASE ?? "http://127.0.0.1:3100";
const AKUN = { user: "admin", sandi: "Admin#2026" };

let lulus = 0;
let gagal = 0;
function periksa(nama, syarat, catatan = "") {
  if (syarat) {
    lulus += 1;
    console.log(`  LULUS  ${nama}${catatan ? "  — " + catatan : ""}`);
  } else {
    gagal += 1;
    console.log(`  GAGAL  ${nama}${catatan ? "  — " + catatan : ""}`);
  }
}

/** Ambil satu kode verifikasi surat keluar langsung dari basis data. */
function kodeVerifikasi() {
  try {
    const keluaran = execFileSync(
      "sudo",
      ["-u", "postgres", "psql", "-d", "app_db", "-tAc",
       "select verification_code from outgoing_letters order by agenda_no limit 1"],
      { encoding: "utf-8" },
    );
    return keluaran.trim();
  } catch {
    return "";
  }
}

const browser = await chromium.launch({ ...(EXE ? { executablePath: EXE } : {}), args: ["--no-sandbox"] });

async function masuk(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', AKUN.user);
  await page.fill('input[name="password"]', AKUN.sandi);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login")),
    page.click('button[type="submit"]'),
  ]);
}

// =============================== A. Verifikasi ===============================
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const kode = kodeVerifikasi();
  const kasus = [
    ["kosong", "", "is-neutral"],
    ["valid", kode, "is-valid"],
    ["tidak ditemukan", "ZZZZZZZZ", "is-invalid"],
    ["format salah", "K7M2-P9Q", "is-invalid"],
    ["huruf kecil + spasi", kode ? kode.toLowerCase().replace(/(.{4})/, "$1 ") : "xxxx xxxx", "is-valid"],
  ];
  const hasil = [];
  for (const [nama, isi, kelas] of kasus) {
    await page.goto(`${BASE}/verifikasi?code=${encodeURIComponent(isi)}`, { waitUntil: "networkidle" });
    const kelasNyata = await page.getAttribute(".verify-status", "class");
    hasil.push(`${nama}:${kelasNyata?.includes(kelas) ? "ok" : kelasNyata}`);
  }
  periksa(
    "verifikasi 5 keadaan benar",
    hasil.every((h) => h.endsWith(":ok")),
    `kode=${kode || "(kosong)"} · ${hasil.join(" · ")}`,
  );
  await page.close();
}

// ============================ B & C & E. Halaman admin ======================
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
page.on("pageerror", (e) => console.log("  !! error halaman:", e.message));
await page.addInitScript(() => {
  window.__cetak = {};
  window.print = function () {
    window.__cetak.judul = document.title;
    const gambar = document.querySelector(".print-qr img");
    window.__cetak.qr = gambar ? gambar.getAttribute("src") : null;
    window.dispatchEvent(new Event("afterprint"));
  };
});

// ------------------------------------------------- E1. tautan pintar dashboard
await masuk(page);
const kartu = await page.$$eval("a.stat-card", (nodes) =>
  nodes.map((n) => ({ label: n.querySelector("p")?.textContent?.trim(), href: n.getAttribute("href") })),
);
periksa(
  "kartu ringkasan dashboard berupa tautan bersaringan",
  kartu.length === 4 &&
    kartu.some((k) => k.href === "/disposisi?status=Pending") &&
    kartu.some((k) => k.href === "/surat-masuk?disposisi=Belum"),
  kartu.map((k) => `${k.label}->${k.href}`).join(" · "),
);

await page.goto(`${BASE}/surat-masuk?disposisi=Belum`, { waitUntil: "networkidle" });
const saringTerpasang = await page.inputValue('select[aria-label="Semua status disposisi"]');
const belum = await page.locator('#tabel-surat-masuk tr[data-disposisi="Belum"]:visible').count();
const sudah = await page.locator('#tabel-surat-masuk tr[data-disposisi="Sudah"]:visible').count();
periksa(
  "saringan dari alamat halaman langsung terpasang",
  saringTerpasang === "Belum" && belum > 0 && sudah === 0,
  `Belum=${belum} · Sudah=${sudah} · "${await page.textContent(".table-count")}"`,
);

// ------------------------------------------------- E2. panel notifikasi
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.click('.notif-wrap button[aria-haspopup="dialog"]');
await page.waitForSelector(".notif-panel");
const isiNotif = await page.locator(".notif-panel .notif-list li").count();
const tautanNotif = await page.getAttribute(".notif-panel a.text-button", "href");
await page.keyboard.press("Escape");
await page.waitForTimeout(150);
periksa(
  "panel notifikasi: isi, tautan, dan Esc",
  isiNotif >= 1 && isiNotif <= 3 && tautanNotif === "/disposisi?status=Pending" &&
    (await page.locator(".notif-panel").count()) === 0,
  `${isiNotif} item · ${tautanNotif}`,
);

// ------------------------------------------------- B. tabel surat masuk
await page.goto(`${BASE}/surat-masuk`, { waitUntil: "networkidle" });
const total = await page.locator("#tabel-surat-masuk tr[data-urut-agenda]").count();
const hitungAwal = await page.textContent(".table-count");
await page.fill('input[type="search"]', "Inspektorat");
await page.waitForTimeout(300);
const hitungSaring = await page.textContent(".table-count");
const barisSaring = await page.locator("#tabel-surat-masuk tr[data-urut-agenda]:visible").count();
await page.click(".search-clear");
await page.waitForTimeout(300);
periksa(
  "pencarian tabel: hitungan, hasil, dan pembersih",
  hitungAwal?.includes(`${total} berkas`) && hitungSaring?.includes(`Menampilkan ${barisSaring} dari ${total}`) &&
    (await page.textContent(".table-count"))?.includes(`${total} berkas`),
  `"${hitungAwal}" → "${hitungSaring}" → dibersihkan`,
);

await page.click('th[data-urut="agenda"]');
await page.waitForTimeout(300);
const urut1 = await page.$$eval("#tabel-surat-masuk tr[data-urut-agenda]", (r) => r.map((x) => Number(x.getAttribute("data-urut-agenda"))));
await page.click('th[data-urut="agenda"]');
await page.waitForTimeout(300);
const urut2 = await page.$$eval("#tabel-surat-masuk tr[data-urut-agenda]", (r) => r.map((x) => Number(x.getAttribute("data-urut-agenda"))));
periksa(
  "klik judul kolom mengurutkan naik lalu turun",
  urut1.every((v, i) => i === 0 || urut1[i - 1] <= v) && urut2.every((v, i) => i === 0 || urut2[i - 1] >= v),
  `${urut1.slice(0, 3).join(",")}… → ${urut2.slice(0, 3).join(",")}…`,
);

await page.click("#tabel-surat-masuk tr[data-urut-agenda] .mini-button");
await page.waitForTimeout(400);
const fokusDiDalam = await page.evaluate(() => {
  const modal = document.querySelector(".modal");
  return modal ? modal.contains(document.activeElement) : false;
});
const gulirTerkunci = await page.evaluate(() => document.body.style.overflow);
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
periksa(
  "modal mengurung fokus dan mengunci gulir",
  fokusDiDalam && gulirTerkunci === "hidden",
  `fokus di dalam=${fokusDiDalam} · body.overflow=${gulirTerkunci}`,
);

// ------------------------------------------------- E3. paginasi + alamat halaman
await page.goto(`${BASE}/surat-masuk`, { waitUntil: "networkidle" });
await page.selectOption('select[aria-label="Jumlah baris per halaman"]', "5");
await page.waitForTimeout(300);
const hal1 = await page.locator("#tabel-surat-masuk tr[data-urut-agenda]:visible").count();
const hitungHal1 = await page.textContent(".table-count");
await page.click('[data-hal="maju"]');
await page.waitForTimeout(300);
const hal2 = await page.locator("#tabel-surat-masuk tr[data-urut-agenda]:visible").count();
const posisi2 = await page.textContent(".pager-posisi");
const alamatPaginasi = new URL(page.url());
periksa(
  "paginasi tabel: ukuran, maju-mundur, rentang, dan alamat",
  hal1 === 5 && hal2 === total - 5 && alamatPaginasi.searchParams.get("hal") === "2",
  `hal.1=${hal1} "${hitungHal1}" · hal.2=${hal2} "${await page.textContent(".table-count")}" · ${posisi2} · ${alamatPaginasi.search}`,
);

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(300);
periksa(
  "muat ulang mempertahankan halaman dan kata pencarian",
  (await page.locator("#tabel-surat-masuk tr[data-urut-agenda]:visible").count()) === total - 5,
  `${await page.textContent(".pager-posisi")} · ${new URL(page.url()).search}`,
);

await page.fill('input[type="search"]', "Inspektorat");
await page.waitForTimeout(300);
const alamatCari = new URL(page.url());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(300);
periksa(
  "kata pencarian tersimpan di alamat halaman",
  alamatCari.searchParams.get("cari") === "Inspektorat" &&
    (await page.inputValue('input[type="search"]')) === "Inspektorat",
  `${alamatCari.search} · "${await page.textContent(".table-count")}"`,
);

// urutan kolom juga hidup di alamat halaman
await page.goto(`${BASE}/surat-masuk`, { waitUntil: "networkidle" });
await page.click('th[data-urut="agenda"]');
await page.waitForTimeout(300);
const alamatUrut = new URL(page.url());
const ariaMinta = await page.getAttribute('th[data-urut="agenda"]', "aria-sort");
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(300);
periksa(
  "urutan kolom ikut di alamat & bertahan setelah muat ulang",
  alamatUrut.searchParams.get("urut") === "agenda" && ariaMinta === "ascending" &&
    (await page.getAttribute('th[data-urut="agenda"]', "aria-sort")) === "ascending",
  `${alamatUrut.search} · ${ariaMinta}`,
);

// ------------------------------------------------- C. daftar kartu
/*
 * Untuk /pengguna, seluruh akun contoh berstatus Aktif — jadi saringan yang
 * terbukti menyaring adalah "Nonaktif" (harus kosong) dilanjutkan "Aktif"
 * (harus memunculkan semuanya kembali).
 */
for (const [rute, grid, kartuSel, kata, statusLabel, harapStatusKosong] of [
  ["/disposisi", "grid-disposisi", ".disposition-card", "Dewi", "Pending", false],
  ["/pegawai", "grid-pegawai", ".staff-card", "Damkar", "Aktif", false],
  ["/pengguna", "grid-pengguna", ".staff-card", "Rina", "Nonaktif", true],
]) {
  await page.goto(`${BASE}${rute}`, { waitUntil: "networkidle" });
  const jumlahKartu = await page.locator(`#${grid} ${kartuSel}`).count();
  const awal = await page.textContent(".table-count");
  await page.fill(`#cari-${grid}`, kata);
  await page.waitForTimeout(300);
  const tersaring = await page.locator(`#${grid} ${kartuSel}:visible`).count();
  const labelSaring = await page.textContent(".table-count");

  await page.fill(`#cari-${grid}`, "");
  await page.selectOption(".table-controls select", statusLabel);
  await page.waitForTimeout(300);
  const perStatus = await page.locator(`#${grid} ${kartuSel}:visible`).count();

  await page.fill(`#cari-${grid}`, "zzzz");
  await page.waitForTimeout(300);
  const pesanKosong = await page.locator(`#${grid} .empty-grid:visible`).count();

  const statusOk = harapStatusKosong ? perStatus === 0 : perStatus > 0 && perStatus < jumlahKartu;
  let statusKeduaOk = true;
  let catatanKedua = "";
  if (harapStatusKosong) {
    await page.fill(`#cari-${grid}`, "");
    await page.selectOption(".table-controls select", "Aktif");
    await page.waitForTimeout(300);
    const semua = await page.locator(`#${grid} ${kartuSel}:visible`).count();
    statusKeduaOk = semua === jumlahKartu;
    catatanKedua = ` · status Aktif ${semua}`;
  }

  periksa(
    `kartu ${rute}: pencarian, saringan status, keadaan kosong`,
    tersaring > 0 && tersaring < jumlahKartu && statusOk && statusKeduaOk && pesanKosong > 0,
    `${jumlahKartu} kartu · "${awal}" → cari "${kata}" ${tersaring} ("${labelSaring}") · status ${statusLabel} ${perStatus}${catatanKedua} · kosong ${pesanKosong ? "tampil" : "tidak"}`,
  );
}

// ------------------------------------------------- E4. cetak disposisi
await page.goto(`${BASE}/disposisi?status=Pending`, { waitUntil: "networkidle" });
const kartuPending = await page.locator('#grid-disposisi .disposition-card[data-status="Pending"]:visible').count();
const kartuSelesai = await page.locator('#grid-disposisi .disposition-card[data-status="Selesai"]:visible').count();
await page.check(".mini-toggle input");
await page.click('.mini-button[title^="Cetak lembar disposisi"]');
await page.waitForTimeout(600);
const hasil = await page.evaluate(() => window.__cetak);
const qr = await page.request.get(`${BASE}/api/qr?text=UJI%20QR`);
periksa(
  "saringan kartu disposisi + cetak (nama berkas & QR) ",
  kartuPending > 0 && kartuSelesai === 0 && /^Disposisi-[A-Za-z0-9-]+$/.test(hasil.judul ?? "") &&
    (hasil.qr ?? "").startsWith("/api/qr?text=") && qr.status() === 200,
  `Pending=${kartuPending} Selesai=${kartuSelesai} · berkas=${hasil.judul} · QR=${qr.status()}`,
);
await page.close();

// ================================ D & E5. Ponsel ============================
{
  const ponsel = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await masuk(ponsel);
  await ponsel.goto(`${BASE}/surat-masuk`, { waitUntil: "networkidle" });
  const tata = await ponsel.evaluate(() => {
    const tabel = document.querySelector(".data-table");
    const thead = document.querySelector(".data-table thead");
    return {
      display: getComputedStyle(tabel).display,
      thead: thead ? getComputedStyle(thead).display : "tidak ada",
      geser: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      label: [...document.querySelectorAll("#tabel-surat-masuk td[data-label]")]
        .slice(0, 3).map((td) => td.getAttribute("data-label")).join(" · "),
    };
  });
  const ukuran = await ponsel.$$eval(
    ".row-icon, .mini-button, .pager-button, .modal-close, .icon-button",
    (nodes) => nodes.map((n) => Math.round(n.getBoundingClientRect().height)),
  );
  periksa(
    "ponsel: tabel menjadi kartu, tanpa geser mendatar",
    tata.display === "block" && tata.thead === "none" && tata.geser <= 0,
    `${tata.display} · thead=${tata.thead} · geser=${tata.geser}px · label: ${tata.label}`,
  );
  periksa(
    "ponsel: sasaran sentuh >= 44px",
    ukuran.length > 0 && Math.min(...ukuran) >= 44,
    `${ukuran.length} kendali · terpendek ${Math.min(...ukuran)}px`,
  );

  await ponsel.click(".mobile-menu");
  await ponsel.waitForTimeout(300);
  const laci = await ponsel.evaluate(() => ({
    x: Math.round(document.getElementById("sidebar").getBoundingClientRect().x),
    latar: getComputedStyle(document.querySelector(".backdrop")).display,
  }));
  await ponsel.click('#sidebar a[href="/pegawai"]');
  await ponsel.waitForTimeout(400);
  periksa(
    "ponsel: laci menu membuka & menutup setelah memilih menu",
    laci.x === 0 && laci.latar !== "none" &&
      !(await ponsel.evaluate(() => document.getElementById("sidebar").classList.contains("open"))),
    `x=${laci.x} · latar=${laci.latar}`,
  );
  await ponsel.close();
}

console.log(`\n${lulus}/${lulus + gagal} pemeriksaan lulus`);
await browser.close();
process.exitCode = gagal === 0 ? 0 : 1;
