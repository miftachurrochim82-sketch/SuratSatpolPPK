"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { IconFilter, IconSearch } from "@/components/Icons";

type Opsi = { value: string; label: string };

type TableFilterProps = {
  placeholder: string;
  /** id elemen <tbody> yang baris-barisnya akan disaring */
  targetId: string;
  /** label baris yang dibaca saat mencocokkan teks pencarian */
  rowSelector?: string;
  options?: Opsi[];
  filterLabel?: string;
  /** nama atribut data-* pada <tr> untuk mencocokkan pilihan filter */
  filterAttribute?: string;
  /** kata untuk satuan hasil, mis. "berkas" atau "pegawai" */
  satuan?: string;
  /** aktifkan pengurutan lewat klik judul kolom yang punya atribut data-urut */
  sortable?: boolean;
};

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

function barisTerlihat(tbody: HTMLElement, rowSelector: string) {
  return Array.from(tbody.querySelectorAll<HTMLTableRowElement>(rowSelector)).filter(
    (baris) => baris.dataset.empty !== "true" && baris.style.display !== "none",
  );
}

/**
 * Menyaring baris tabel yang sudah dirender server, langsung di browser,
 * lalu memberi tahu berapa baris yang tersisa dan menyediakan tombol bersihkan.
 * Bila `sortable` aktif, klik judul kolom ber-atribut data-urut akan mengurutkan baris.
 */
export default function TableFilter({
  placeholder,
  targetId,
  rowSelector = "tr",
  options,
  filterLabel = "Semua klasifikasi",
  filterAttribute = "data-kode",
  satuan = "berkas",
  sortable = false,
}: TableFilterProps) {
  const [kata, setKata] = useState("");
  const [pilihan, setPilihan] = useState("");
  // teks jumlah dikelola langsung lewat DOM: tidak perlu state, jadi tidak ada
  // setState di dalam effect dan tabel bisa langsung menyesuaikan diri
  const kotakJumlah = useRef<HTMLSpanElement>(null);

  const terapkan = useCallback(
    (teks: string, kode: string) => {
      const tbody = document.getElementById(targetId);
      if (!tbody) return;
      const cari = teks.trim().toLowerCase();
      let jumlah = 0;

      tbody.querySelectorAll<HTMLTableRowElement>(rowSelector).forEach((baris) => {
        // baris kosong (empty-state) selalu disembunyikan saat ada filter aktif
        if (baris.dataset.empty === "true") {
          baris.style.display = cari || kode ? "none" : "";
          return;
        }
        const cocokTeks = !cari || (baris.textContent ?? "").toLowerCase().includes(cari);
        const cocokKode = !kode || (baris.getAttribute(filterAttribute) ?? "") === kode;
        const tampil = cocokTeks && cocokKode;
        baris.style.display = tampil ? "" : "none";
        if (tampil) jumlah += 1;
      });

      const semua = Array.from(
        tbody.querySelectorAll<HTMLTableRowElement>(rowSelector),
      ).filter((baris) => baris.dataset.empty !== "true").length;

      const penanda = tbody.querySelector<HTMLTableRowElement>('tr[data-empty="true"]');
      if (penanda) penanda.style.display = jumlah === 0 ? "" : "none";

      const kotak = kotakJumlah.current;
      if (kotak) {
        if (jumlah === 0) kotak.textContent = `Tidak ada ${satuan} yang cocok`;
        else if (!cari && !kode) kotak.textContent = `${semua} ${satuan}`;
        else kotak.textContent = `Menampilkan ${jumlah} dari ${semua} ${satuan}`;
      }
    },
    [filterAttribute, rowSelector, satuan, targetId],
  );

  // hitung jumlah awal setelah tabel dirender
  useEffect(() => {
    terapkan("", "");
  }, [terapkan]);

  // pengurutan lewat klik judul kolom
  useEffect(() => {
    if (!sortable) return;
    const tbody = document.getElementById(targetId);
    const tabel = tbody?.closest("table");
    if (!tbody || !tabel) return;

    const bersihkan: Array<() => void> = [];

    tabel.querySelectorAll<HTMLTableCellElement>("th[data-urut]").forEach((th) => {
      const klik = () => {
        const kunci = th.getAttribute("data-urut") ?? "";
        const naik = th.getAttribute("aria-sort") !== "ascending";

        tabel.querySelectorAll<HTMLTableCellElement>("th[data-urut]").forEach((lain) => {
          if (lain !== th) lain.setAttribute("aria-sort", "none");
        });
        th.setAttribute("aria-sort", naik ? "ascending" : "descending");

        const baris = Array.from(tbody.querySelectorAll<HTMLTableRowElement>(rowSelector)).filter(
          (item) => item.dataset.empty !== "true",
        );

        baris.sort((a, b) => {
          let x: number;
          let y: number;
          if (kunci === "tanggal") {
            const selX = a.querySelector<HTMLTableCellElement>('td[data-label="Diterima"], td[data-label="Tanggal"]');
            const selY = b.querySelector<HTMLTableCellElement>('td[data-label="Diterima"], td[data-label="Tanggal"]');
            x = tanggalAngka(selX?.textContent ?? "");
            y = tanggalAngka(selY?.textContent ?? "");
          } else {
            x = Number(a.getAttribute("data-urut-agenda") ?? 0);
            y = Number(b.getAttribute("data-urut-agenda") ?? 0);
          }
          return naik ? x - y : y - x;
        });

        baris.forEach((item) => tbody.appendChild(item));
        const penanda = tbody.querySelector<HTMLTableRowElement>('tr[data-empty="true"]');
        if (penanda) tbody.appendChild(penanda);

        terapkan(kata, pilihan);
      };

      const tekanTombol = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          klik();
        }
      };

      th.setAttribute("tabindex", "0");
      th.setAttribute("role", "button");
      th.addEventListener("click", klik);
      th.addEventListener("keydown", tekanTombol);
      bersihkan.push(() => {
        th.removeEventListener("click", klik);
        th.removeEventListener("keydown", tekanTombol);
      });
    });

    return () => bersihkan.forEach((fn) => fn());
  }, [sortable, targetId, rowSelector, terapkan, kata, pilihan]);

  function ubahTeks(event: ChangeEvent<HTMLInputElement>) {
    setKata(event.target.value);
    terapkan(event.target.value, pilihan);
  }

  function ubahPilihan(event: ChangeEvent<HTMLSelectElement>) {
    setPilihan(event.target.value);
    terapkan(kata, event.target.value);
  }

  function bersihkan() {
    setKata("");
    setPilihan("");
    terapkan("", "");
    const kolom = document.getElementById(`cari-${targetId}`);
    kolom?.focus();
  }

  const adaSaringan = kata.trim() !== "" || pilihan !== "";

  return (
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
            aria-label="Bersihkan pencarian"
            title="Bersihkan"
          >
            ✕
          </button>
        ) : null}
      </label>

      {options && options.length > 0 ? (
        <label className="filter-button" style={{ gap: 8 }}>
          <IconFilter size={12} />
          <select
            value={pilihan}
            onChange={ubahPilihan}
            aria-label={filterLabel}
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
            <option value="">{filterLabel}</option>
            {options.map((opsi) => (
              <option key={opsi.value} value={opsi.value}>
                {opsi.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <span className="table-count" ref={kotakJumlah} role="status" aria-live="polite" />
    </div>
  );
}
