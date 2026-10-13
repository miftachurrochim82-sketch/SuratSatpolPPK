"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore, type ChangeEvent } from "react";
import { IconFilter, IconSearch } from "@/components/Icons";
import { angkaParam, cuplikanUrl, cuplikanUrlServer, langgananUrl, param, tulis } from "@/lib/urlstate";

type Opsi = { value: string; label: string };

export type FilterKolom = {
  /** nama parameter di alamat halaman, mis. "status" atau "disposisi" */
  param: string;
  /** atribut data-* pada <tr> yang nilainya dibandingkan dengan pilihan */
  attribute: string;
  /** label pilihan pertama, mis. "Semua klasifikasi" */
  label: string;
  options: Opsi[];
};

type TableFilterProps = {
  placeholder: string;
  /** id elemen <tbody> yang baris-barisnya akan disaring */
  targetId: string;
  /** label baris yang dibaca saat mencocokkan teks pencarian */
  rowSelector?: string;
  /** satu atau beberapa saringan tetap */
  filters?: FilterKolom[];
  /** cara lama (satu saringan) — masih didukung */
  options?: Opsi[];
  filterLabel?: string;
  filterAttribute?: string;
  /** kata untuk satuan hasil, mis. "berkas" atau "pegawai" */
  satuan?: string;
  /** aktifkan pengurutan lewat klik judul kolom yang punya atribut data-urut */
  sortable?: boolean;
  /** jumlah baris per halaman (10 = bawaan, 0 = semua) */
  ukuranHalaman?: number;
};

const PILIHAN_UKURAN = [5, 10, 25, 50, 0];

const BULAN: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, jun: 6,
  jul: 7, agu: 8, sep: 9, okt: 10, nov: 11, des: 12,
};

/** Ubah "13 Okt 2026" menjadi 20261013 supaya bisa dibandingkan. */
function tanggalAngka(teks: string) {
  const cocok = /(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/.exec(teks);
  if (!cocok) return 0;
  const bulan = BULAN[cocok[2].toLowerCase()] ?? 1;
  return Number(`${cocok[3]}${String(bulan).padStart(2, "0")}${cocok[1].padStart(2, "0")}`);
}

/** Teks baris tanpa isi kendali (select/option/button) agar pencarian tidak salah cocok. */
function teksUntukCari(el: HTMLElement) {
  const salinan = el.cloneNode(true) as HTMLElement;
  salinan.querySelectorAll("select, option, button, script, style").forEach((n) => n.remove());
  return (salinan.textContent ?? "").toLowerCase();
}

const ingatanTeks = new WeakMap<HTMLElement, string>();

/**
 * Menyaring, mengurutkan, dan membagi baris tabel menjadi halaman — semuanya
 * di browser, tanpa memuat ulang halaman.
 *
 * Keadaan saringan disimpan di alamat halaman (lihat lib/urlstate.ts) sehingga
 * hasil saringan bisa disalin, dikirim ke rekan kerja, atau dimuat ulang tanpa
 * hilang. Jumlah hasil dan nomor halaman ditulis langsung ke DOM lewat ref,
 * bukan lewat state, agar tidak ada setState di dalam effect.
 */
export default function TableFilter({
  placeholder,
  targetId,
  rowSelector = "tr",
  filters,
  options,
  filterLabel = "Semua klasifikasi",
  filterAttribute = "data-kode",
  satuan = "berkas",
  sortable = false,
  ukuranHalaman = 10,
}: TableFilterProps) {
  const kueri = useSyncExternalStore(langgananUrl, cuplikanUrl, cuplikanUrlServer);

  // bila `filters` tidak diisi, pakai satu saringan dari cara lama
  const daftarSaringan = useMemo<FilterKolom[]>(
    () =>
      filters ??
      (options && options.length > 0
        ? [{ param: "status", attribute: filterAttribute, label: filterLabel, options }]
        : []),
    [filters, options, filterAttribute, filterLabel],
  );

  const kata = param(kueri, "cari");
  const urut = param(kueri, "urut");
  const arah = param(kueri, "arah");
  const ukuran = angkaParam(kueri, "ukuran", ukuranHalaman);
  const halMinta = angkaParam(kueri, "hal", 1);

  const kotakJumlah = useRef<HTMLSpanElement>(null);
  const pager = useRef<HTMLElement>(null);
  const posisi = useRef<HTMLSpanElement>(null);
  const halamanTerakhir = useRef(1);

  const adaSaringan =
    kata.trim() !== "" || daftarSaringan.some((saringan) => param(kueri, saringan.param) !== "");

  // ---- satu tempat yang mengubah tampilan tabel -------------------------
  useEffect(() => {
    const tbody = document.getElementById(targetId);
    if (!tbody) return;

    const semua = Array.from(tbody.querySelectorAll<HTMLTableRowElement>(rowSelector)).filter(
      (baris) => baris.dataset.empty !== "true",
    );
    const cari = kata.trim().toLowerCase();
    const nilaiSaringan = daftarSaringan.map((saringan) => param(kueri, saringan.param));

    const cocok = semua.filter((baris) => {
      if (!ingatanTeks.has(baris)) ingatanTeks.set(baris, teksUntukCari(baris));
      const cocokTeks = !cari || (ingatanTeks.get(baris) ?? "").includes(cari);
      const cocokSaringan = daftarSaringan.every((saringan, i) => {
        const pilihan = nilaiSaringan[i];
        return !pilihan || (baris.getAttribute(saringan.attribute) ?? "") === pilihan;
      });
      return cocokTeks && cocokSaringan;
    });

    // pengurutan: hanya baris yang cocok yang disusun ulang
    if (sortable && urut) {
      const naik = arah !== "turun";
      const angka = (baris: HTMLTableRowElement) => {
        if (urut === "tanggal") {
          const sel = baris.querySelector<HTMLTableCellElement>(
            'td[data-label="Diterima"], td[data-label="Tanggal"]',
          );
          return tanggalAngka(sel?.textContent ?? "");
        }
        return Number(baris.getAttribute("data-urut-agenda") ?? 0);
      };
      [...cocok]
        .sort((a, b) => (naik ? angka(a) - angka(b) : angka(b) - angka(a)))
        .forEach((baris) => tbody.appendChild(baris));
    }

    // penanda urutan pada judul kolom
    const tabel = tbody.closest("table");
    if (tabel) {
      tabel.querySelectorAll<HTMLTableCellElement>("th[data-urut]").forEach((th) => {
        const kunci = th.getAttribute("data-urut") ?? "";
        const aktif = kunci === urut;
        th.setAttribute("aria-sort", aktif ? (arah === "turun" ? "descending" : "ascending") : "none");
      });
    }

    // pembagian halaman
    const total = cocok.length;
    const perHalaman = ukuran > 0 ? ukuran : Math.max(total, 1);
    const jumlahHalaman = Math.max(1, Math.ceil(total / perHalaman));
    const hal = Math.min(Math.max(1, halMinta), jumlahHalaman);
    const mulai = (hal - 1) * perHalaman;
    const akhir = Math.min(mulai + perHalaman, total);
    const terlihat = new Set(cocok.slice(mulai, akhir));

    semua.forEach((baris) => {
      baris.style.display = terlihat.has(baris) ? "" : "none";
    });

    const penanda = tbody.querySelector<HTMLTableRowElement>('tr[data-empty="true"]');
    if (penanda) penanda.style.display = total === 0 ? "" : "none";

    // jumlah hasil
    const kotak = kotakJumlah.current;
    if (kotak) {
      if (total === 0) kotak.textContent = `Tidak ada ${satuan} yang cocok`;
      else if (jumlahHalaman === 1 && !adaSaringan) kotak.textContent = `${total} ${satuan}`;
      else if (jumlahHalaman === 1)
        kotak.textContent = `Menampilkan ${total} dari ${semua.length} ${satuan}`;
      else {
        const saringanAktif = adaSaringan ? ` · tersaring dari ${semua.length}` : "";
        kotak.textContent = `Menampilkan ${mulai + 1}–${akhir} dari ${total} ${satuan}${saringanAktif}`;
      }
    }

    // penggaris halaman
    halamanTerakhir.current = jumlahHalaman;
    const bilah = pager.current;
    if (bilah) {
      const perlu = jumlahHalaman > 1 || semua.length > PILIHAN_UKURAN[0];
      bilah.dataset.aktif = perlu ? "true" : "false";
      if (posisi.current) posisi.current.textContent = `Halaman ${hal} dari ${jumlahHalaman}`;
      const mundur = bilah.querySelector<HTMLButtonElement>('[data-hal="mundur"]');
      const maju = bilah.querySelector<HTMLButtonElement>('[data-hal="maju"]');
      if (mundur) mundur.disabled = hal <= 1;
      if (maju) maju.disabled = hal >= jumlahHalaman;
    }
  }, [targetId, rowSelector, satuan, sortable, ukuran, halMinta, urut, arah, kata, kueri, adaSaringan, daftarSaringan]);

  // ---- klik judul kolom untuk mengurutkan --------------------------------
  useEffect(() => {
    if (!sortable) return;
    const tbody = document.getElementById(targetId);
    const tabel = tbody?.closest("table");
    if (!tbody || !tabel) return;

    const bersihkan: Array<() => void> = [];

    tabel.querySelectorAll<HTMLTableCellElement>("th[data-urut]").forEach((th) => {
      const jalankan = () => {
        const kunci = th.getAttribute("data-urut") ?? "";
        const naik = th.getAttribute("aria-sort") !== "ascending";
        tulis({ urut: kunci, arah: naik ? "naik" : "turun", hal: "" });
      };
      const lewatPapanTik = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          jalankan();
        }
      };
      th.setAttribute("tabindex", "0");
      th.setAttribute("role", "button");
      th.addEventListener("click", jalankan);
      th.addEventListener("keydown", lewatPapanTik);
      bersihkan.push(() => {
        th.removeEventListener("click", jalankan);
        th.removeEventListener("keydown", lewatPapanTik);
      });
    });

    return () => bersihkan.forEach((fn) => fn());
  }, [sortable, targetId, rowSelector]);

  function ubahTeks(event: ChangeEvent<HTMLInputElement>) {
    // setiap ketikan ikut mengembalikan tampilan ke halaman pertama
    tulis({ cari: event.target.value, hal: "" });
  }

  function ubahSaringan(nama: string, nilai: string) {
    tulis({ [nama]: nilai, hal: "" });
  }

  function ubahUkuran(event: ChangeEvent<HTMLSelectElement>) {
    const nilai = Number(event.target.value);
    tulis({ ukuran: nilai === ukuranHalaman ? "" : String(nilai), hal: "" });
  }

  function pindahHalaman(langkah: number) {
    const sekarang = angkaParam(window.location.search, "hal", 1);
    const tujuan = Math.min(Math.max(1, sekarang + langkah), halamanTerakhir.current);
    tulis({ hal: tujuan <= 1 ? "" : String(tujuan) });
  }

  function bersihkan() {
    const hapus: Record<string, string> = { cari: "", hal: "" };
    daftarSaringan.forEach((saringan) => {
      hapus[saringan.param] = "";
    });
    tulis(hapus);
    document.getElementById(`cari-${targetId}`)?.focus();
  }

  return (
    <>
      <div className="table-controls">
        <label className="search-field">
          <IconSearch size={14} />
          <input
            id={`cari-${targetId}`}
            type="search"
            value={kata}
            onChange={ubahTeks}
            placeholder={placeholder}
            aria-label={placeholder}
          />
          {adaSaringan ? (
            <button
              type="button"
              className="search-clear"
              onClick={bersihkan}
              aria-label="Bersihkan pencarian dan saringan"
              title="Bersihkan"
            >
              ✕
            </button>
          ) : null}
        </label>

        {daftarSaringan.map((saringan) => (
          <label className="filter-button" style={{ gap: 8 }} key={saringan.param}>
            <IconFilter size={12} />
            <select
              value={param(kueri, saringan.param)}
              onChange={(event) => ubahSaringan(saringan.param, event.target.value)}
              aria-label={saringan.label}
              style={{
                border: 0,
                background: "transparent",
                color: "inherit",
                font: "inherit",
                outline: "none",
                padding: "8px 2px",
                maxWidth: 190,
              }}
            >
              <option value="">{saringan.label}</option>
              {saringan.options.map((opsi) => (
                <option key={opsi.value} value={opsi.value}>
                  {opsi.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        <span className="table-count" ref={kotakJumlah} role="status" aria-live="polite" />
      </div>

      <nav className="table-pager" ref={pager} aria-label="Navigasi halaman">
        <label className="pager-size">
          Baris per halaman
          <select value={String(ukuran)} onChange={ubahUkuran} aria-label="Jumlah baris per halaman">
            {PILIHAN_UKURAN.map((nilai) => (
              <option key={nilai} value={String(nilai)}>
                {nilai === 0 ? "Semua" : nilai}
              </option>
            ))}
          </select>
        </label>
        <div className="pager-nav">
          <button
            type="button"
            className="pager-button"
            data-hal="mundur"
            onClick={() => pindahHalaman(-1)}
            aria-label="Halaman sebelumnya"
          >
            ‹ Sebelumnya
          </button>
          <span className="pager-posisi" ref={posisi} role="status" aria-live="polite" />
          <button
            type="button"
            className="pager-button"
            data-hal="maju"
            onClick={() => pindahHalaman(1)}
            aria-label="Halaman berikutnya"
          >
            Berikutnya ›
          </button>
        </div>
      </nav>
    </>
  );
}
