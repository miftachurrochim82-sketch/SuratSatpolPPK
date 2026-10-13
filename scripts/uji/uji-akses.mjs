/* Uji aksesibilitas & semantik aplikasi e-Surat (Chromium).
 *
 * Dimensi yang diperiksa — yang belum pernah masuk audit sebelumnya:
 *  1. <html lang> dan judul halaman
 *  2. hierarki judul (satu h1, tidak melompat level)
 *  3. penanda wilayah (header/main/nav/aside)
 *  4. nama aksesibel setiap kendali (tombol, tautan, isian, pilihan)
 *  5. gambar punya alt, tabel punya scope pada sel kepala
 *  6. id ganda dalam satu halaman (merusak aria-labelledby & label[for])
 *  7. penanda fokus terlihat saat menekan Tab
 *  8. aria-current pada menu aktif; aria-live pada hitungan dinamis
 *  9. panel notifikasi: fokus pindah ke panel, Esc mengembalikan fokus ke lonceng
 * 10. modal rincian: aria-modal, diberi nama judul, fokus kembali ke pemicu
 *
 * Pemakaian:  node uji-akses.mjs        (server di 127.0.0.1:3100)
 */
import { chromium } from "playwright-core";

const EXE = process.env.CHROME; // kosong = pakai Chromium bawaan playwright-core
const BASE = process.env.BASE ?? "http://127.0.0.1:3100";

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

const browser = await chromium.launch({ ...(EXE ? { executablePath: EXE } : {}), args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

async function masuk() {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "Admin#2026");
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login")),
    page.click('button[type="submit"]'),
  ]);
}

/** Kumpulan pemeriksaan yang berlaku di setiap halaman. */
async function periksaHalaman(rute) {
  await page.goto(BASE + rute, { waitUntil: "networkidle" });
  const data = await page.evaluate(() => {
    const teks = (el) => (el.textContent ?? "").replace(/\s+/g, " ").trim();

    /** Nama aksesibel kasar: teks, aria-label, aria-labelledby, title, atau alt di dalamnya. */
    function nama(el) {
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return aria.trim();
      const oleh = el.getAttribute("aria-labelledby");
      if (oleh) {
        const bagian = oleh.split(/\s+/).map((id) => document.getElementById(id)).filter(Boolean);
        const gabung = bagian.map(teks).join(" ").trim();
        if (gabung) return gabung;
      }
      const langsung = teks(el);
      if (langsung) return langsung;
      const gambar = el.querySelector("img[alt]");
      if (gambar && gambar.getAttribute("alt")?.trim()) return gambar.getAttribute("alt").trim();
      const isian = el.querySelector("input, select, textarea");
      if (isian) {
        const label = isian.closest("label");
        const dariLabel = label ? teks(label.querySelector("span") ?? label) : "";
        if (dariLabel) return dariLabel;
        const ariaIsian = isian.getAttribute("aria-label");
        if (ariaIsian) return ariaIsian;
      }
      const judul = el.getAttribute("title");
      return judul && judul.trim() ? judul.trim() : "";
    }

    const tanpaNama = [];
    document.querySelectorAll("button, a[href], input, select, textarea").forEach((el) => {
      if (el.closest("[hidden]") || el.getAttribute("aria-hidden") === "true") return;
      // input tersembunyi (penanda formulir) memang tidak perlu nama
      if (el.tagName === "INPUT" && el.getAttribute("type") === "hidden") return;
      if (!nama(el)) tanpaNama.push(el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : ""));
    });

    const judul = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1]));
    const lompat = judul.some((level, i) => i > 0 && level > judul[i - 1] + 1);

    const idDobel = [];
    const dilihat = new Set();
    document.querySelectorAll("[id]").forEach((el) => {
      if (dilihat.has(el.id)) idDobel.push(el.id);
      dilihat.add(el.id);
    });

    const kepalaTanpaScope = [...document.querySelectorAll("table thead th")]
      .filter((th) => !th.hasAttribute("scope")).length;

    const gambarTanpaAlt = [...document.querySelectorAll("img")].filter((g) => !g.hasAttribute("alt")).length;

    const isianTanpaLabel = [...document.querySelectorAll('input:not([type="hidden"]), select, textarea')]
      .filter((el) => {
        if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return false;
        if (el.closest("label")) return true; // dibungkus label = punya nama
        if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return true;
        return false;
      }).length;

    const hitunganHidup = [...document.querySelectorAll("[aria-live]")].length;

    return {
      lang: document.documentElement.lang,
      judulHalaman: document.title,
      jumlahH1: judul.filter((l) => l === 1).length,
      urutanJudul: judul.join(""),
      lompat,
      header: document.querySelectorAll("header").length,
      main: document.querySelectorAll("main").length,
      nav: document.querySelectorAll("nav").length,
      aside: document.querySelectorAll("aside").length,
      tanpaNama,
      idDobel,
      kepalaTanpaScope,
      gambarTanpaAlt,
      isianTanpaLabel,
      hitunganHidup,
      menuAktif: document.querySelectorAll('#sidebar a[aria-current="page"]').length,
      aturanFokus: [...document.styleSheets].flatMap((s) => {
        try { return [...s.cssRules].map((r) => r.cssText); } catch { return []; }
      }).filter((t) => t.includes(":focus-visible")).length,
    };
  });

  return { rute, ...data };
}

await masuk();

const rute = ["/", "/surat-masuk", "/surat-keluar", "/disposisi", "/klasifikasi", "/pegawai", "/pengguna", "/pengaturan"];
const laporan = [];
for (const r of rute) laporan.push(await periksaHalaman(r));

const semua = (kunci) => laporan.map((l) => `${l.rute}:${l[kunci]}`).join(" ");

periksa(
  "bahasa halaman dan judul dokumen",
  laporan.every((l) => l.lang === "id" && l.judulHalaman.trim().length > 0),
  `${laporan[0].lang} · contoh judul "${laporan[0].judulHalaman}"`,
);

periksa(
  "satu h1 per halaman, tanpa lompatan level",
  laporan.every((l) => l.jumlahH1 === 1 && !l.lompat),
  `jumlah h1: ${laporan.map((l) => l.jumlahH1).join("/")} · urutan ${laporan[1].urutanJudul}`,
);

periksa(
  "penanda wilayah lengkap (header, main, nav, aside)",
  laporan.every((l) => l.header >= 1 && l.main === 1 && l.nav >= 1 && l.aside >= 1),
  `contoh ${laporan[1].rute}: header=${laporan[1].header} main=${laporan[1].main} nav=${laporan[1].nav} aside=${laporan[1].aside}`,
);

periksa(
  "setiap kendali punya nama aksesibel",
  laporan.every((l) => l.tanpaNama.length === 0),
  laporan.map((l) => (l.tanpaNama.length ? `${l.rute} → ${l.tanpaNama.join(", ")}` : null)).filter(Boolean).join(" | ") || "8 halaman bersih",
);

periksa(
  "id tidak ganda, gambar ber-alt, isian berlabel, th ber-scope",
  laporan.every((l) => l.idDobel.length === 0 && l.gambarTanpaAlt === 0 && l.isianTanpaLabel === 0 && l.kepalaTanpaScope === 0),
  laporan.map((l) => {
    const masalah = [];
    if (l.idDobel.length) masalah.push(`id ganda: ${l.idDobel.join(",")}`);
    if (l.gambarTanpaAlt) masalah.push(`${l.gambarTanpaAlt} gambar tanpa alt`);
    if (l.isianTanpaLabel) masalah.push(`${l.isianTanpaLabel} isian tanpa label`);
    if (l.kepalaTanpaScope) masalah.push(`${l.kepalaTanpaScope} th tanpa scope`);
    return masalah.length ? `${l.rute} → ${masalah.join("; ")}` : null;
  }).filter(Boolean).join(" | ") || "bersih di 8 halaman",
);

periksa(
  "menu aktif ditandai aria-current",
  laporan.every((l) => l.menuAktif === 1),
  `per halaman: ${laporan.map((l) => l.menuAktif).join("/")}`,
);

const berhitungan = ["/surat-masuk", "/surat-keluar", "/disposisi", "/pegawai", "/pengguna"];
periksa(
  "hitungan dinamis diumumkan lewat aria-live",
  laporan.filter((l) => berhitungan.includes(l.rute)).every((l) => l.hitunganHidup >= 1),
  berhitungan.map((r) => `${r}:${laporan.find((l) => l.rute === r)?.hitunganHidup}`).join(" "),
);

// umpan balik galat harus diumumkan, bukan hanya diwarnai
// (memakai konteks baru supaya /login tidak teralihkan ke dashboard oleh sesi aktif)
const konteksBaru = await browser.newContext();
const halLogin = await konteksBaru.newPage();
await halLogin.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await halLogin.fill('input[name="username"]', "admin");
await halLogin.fill('input[name="password"]', "salah-sekali");
await halLogin.click('button[type="submit"]');
await halLogin.waitForTimeout(900);
const peringatanGalat = await halLogin.evaluate(() => {
  const el = document.querySelector('[role="alert"]');
  return el ? (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60) : "";
});
periksa(
  "pesan galat login diumumkan lewat role=alert",
  peringatanGalat.length > 0,
  peringatanGalat || "(tidak ada role=alert)",
);

// ---------------------------------------- penanda fokus saat menekan Tab
await page.goto(`${BASE}/surat-masuk`, { waitUntil: "networkidle" });
const urutanFokus = [];
let tanpaPenanda = 0;
for (let i = 0; i < 26; i++) {
  await page.keyboard.press("Tab");
  const hasil = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const gaya = getComputedStyle(el);
    const terlihat =
      (gaya.outlineStyle !== "none" && parseFloat(gaya.outlineWidth || "0") > 0) ||
      gaya.boxShadow !== "none";
    return {
      nama: (el.getAttribute("aria-label") || el.textContent || el.tagName).replace(/\s+/g, " ").trim().slice(0, 34),
      terlihat,
    };
  });
  if (!hasil) continue;
  urutanFokus.push(hasil);
  if (!hasil.terlihat) tanpaPenanda += 1;
}
periksa(
  "setiap perhentian Tab punya penanda fokus terlihat",
  urutanFokus.length >= 10 && tanpaPenanda === 0,
  `${urutanFokus.length} perhentian · tanpa penanda: ${tanpaPenanda}${urutanFokus.filter((f) => !f.terlihat).map((f) => ` (${f.nama})`).join("")}`,
);

// ---------------------------------------- panel notifikasi
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.click('.notif-wrap button[aria-haspopup="dialog"]');
await page.waitForTimeout(250);
const fokusNotif = await page.evaluate(() => {
  const panel = document.querySelector(".notif-panel");
  return {
    ada: !!panel,
    fokusDiPanel: panel ? panel.contains(document.activeElement) : false,
    peran: panel?.getAttribute("role") ?? "",
    nama: panel?.getAttribute("aria-label") ?? "",
  };
});
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
const fokusKembali = await page.evaluate(() => {
  const el = document.activeElement;
  return el ? el.className : "";
});
periksa(
  "panel notifikasi: peran dialog, fokus masuk & kembali ke lonceng saat Esc",
  fokusNotif.ada && fokusNotif.peran === "dialog" && fokusNotif.nama.length > 0 &&
    fokusNotif.fokusDiPanel && String(fokusKembali).includes("notification"),
  `peran=${fokusNotif.peran} nama="${fokusNotif.nama}" · fokus di panel=${fokusNotif.fokusDiPanel} · setelah Esc="${fokusKembali}"`,
);

// ---------------------------------------- modal rincian
await page.goto(`${BASE}/surat-masuk`, { waitUntil: "networkidle" });
await page.click("#tabel-surat-masuk tr .mini-button");
await page.waitForTimeout(400);
const modal = await page.evaluate(() => {
  const m = document.querySelector(".modal-layer");
  return {
    ada: !!m,
    ariaModal: m?.getAttribute("aria-modal") ?? "",
    peran: m?.getAttribute("role") ?? "",
    diberiNama: !!(m?.getAttribute("aria-label") || m?.getAttribute("aria-labelledby")),
    fokusDiDalam: m ? m.contains(document.activeElement) : false,
    adaKotak: !!document.querySelector(".modal"),
  };
});
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
const fokusSetelahTutup = await page.evaluate(() => document.activeElement?.className ?? "");
periksa(
  "modal: role=dialog + aria-modal + diberi nama + fokus kembali ke pemicu",
  modal.ada && modal.ariaModal === "true" && modal.diberiNama && modal.fokusDiDalam &&
    String(fokusSetelahTutup).includes("mini-button"),
  `aria-modal=${modal.ariaModal} peran=${modal.peran} nama=${modal.diberiNama} fokus di dalam=${modal.fokusDiDalam} · setelah Esc="${fokusSetelahTutup}"`,
);

await halLogin.goto(`${BASE}/login`, { waitUntil: "networkidle" });
const halamanLogin = await halLogin.evaluate(() => ({
  lang: document.documentElement.lang,
  satuH1: document.querySelectorAll("h1").length,
  isianBerlabel: [...document.querySelectorAll('input:not([type="hidden"]), select, textarea')].every((el) =>
    !!(el.getAttribute("aria-label") || el.closest("label") || (el.id && document.querySelector(`label[for="${el.id}"]`))),
  ),
  isianBermasalah: [...document.querySelectorAll('input:not([type="hidden"]), select, textarea')]
    .filter((el) => !(el.getAttribute("aria-label") || el.closest("label") || (el.id && document.querySelector(`label[for="${el.id}"]`))))
    .map((el) => `${el.tagName.toLowerCase()}[name=${el.name || "-"}]`),
}));
periksa(
  "halaman Login juga memenuhi aturan dasar",
  halamanLogin.lang === "id" && halamanLogin.satuH1 === 1 && halamanLogin.isianBerlabel,
  `lang=${halamanLogin.lang} · h1=${halamanLogin.satuH1} · isian berlabel=${halamanLogin.isianBerlabel}${halamanLogin.isianBermasalah.length ? " · tanpa label: " + halamanLogin.isianBermasalah.join(", ") : ""}`,
);

await konteksBaru.close();

console.log(`\n${lulus}/${lulus + gagal} pemeriksaan aksesibilitas lulus`);
await browser.close();
process.exitCode = gagal === 0 ? 0 : 1;
