"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { IconFilter, IconSearch } from "@/components/Icons";

type Opsi = { value: string; label: string };

/**
 * Teks yang dipakai untuk pencocokan: isi <select>, <option>, dan <button>
 * dibuang lebih dulu. Tanpa ini, kartu pengguna yang punya daftar pilihan peran
 * akan selalu cocok dengan kata "admin" atau "pimpinan" — padahal itu bukan isi kartunya.
 */
function teksUntukCari(el: HTMLElement) {
  const salinan = el.cloneNode(true) as HTMLElement;
  salinan.querySelectorAll("select, option, button, script, style").forEach((n) => n.remove());
  return (salinan.textContent ?? "").toLowerCase();
}

const ingatanTeks = new WeakMap<HTMLElement, string>();

type GridFilterProps = {
  placeholder: string;
  /** id wadah kartu, mis. "grid-disposisi" */
  targetId: string;
  /** selektor kartu di dalam wadah */
  kartuSelector: string;
  /** atribut pada kartu yang nilainya dibandingkan dengan pilihan saringan */
  statusAttribute?: string;
  options?: Opsi[];
  filterLabel?: string;
  satuan?: string;
  /** pesan saat tidak ada kartu yang cocok */
  kosong?: { judul: string; pesan: string };
};

/**
 * Menyaring daftar berbentuk kartu langsung di browser, tanpa query ulang.
 * Sama seperti TableFilter tetapi bekerja pada kartu, bukan baris tabel.
 */
export default function GridFilter({
  placeholder,
  targetId,
  kartuSelector,
  statusAttribute = "data-status",
  options,
  filterLabel = "Semua status",
  satuan = "data",
  kosong = { judul: "Tidak ada yang cocok", pesan: "Ubah kata pencarian atau pilih status lain." },
}: GridFilterProps) {
  const [kata, setKata] = useState("");
  const [pilihan, setPilihan] = useState("");
  const kotakJumlah = useRef<HTMLSpanElement>(null);

  const terapkan = useCallback(
    (teks: string, status: string) => {
      const wadah = document.getElementById(targetId);
      if (!wadah) return;

      const cari = teks.trim().toLowerCase();
      const kartu = Array.from(wadah.querySelectorAll<HTMLElement>(kartuSelector));
      let jumlah = 0;

      kartu.forEach((item) => {
        if (!ingatanTeks.has(item)) ingatanTeks.set(item, teksUntukCari(item));
        const cocokTeks = !cari || (ingatanTeks.get(item) ?? "").includes(cari);
        const cocokStatus = !status || (item.getAttribute(statusAttribute) ?? "") === status;
        const tampil = cocokTeks && cocokStatus;
        item.style.display = tampil ? "" : "none";
        if (tampil) jumlah += 1;
      });

      // penanda "tidak ada hasil" dibuat sekali, lalu dipakai ulang
      let penanda = wadah.querySelector<HTMLElement>(":scope > .empty-grid");
      if (jumlah === 0 && kartu.length > 0) {
        if (!penanda) {
          penanda = document.createElement("div");
          penanda.className = "empty-grid";
          const judul = document.createElement("strong");
          judul.textContent = kosong.judul;
          const pesan = document.createElement("p");
          pesan.textContent = kosong.pesan;
          penanda.append(judul, pesan);
          wadah.appendChild(penanda);
        }
        penanda.style.display = "";
      } else if (penanda) {
        penanda.style.display = "none";
      }

      const kotak = kotakJumlah.current;
      if (kotak) {
        if (kartu.length === 0) kotak.textContent = "";
        else if (!cari && !status) kotak.textContent = `${kartu.length} ${satuan}`;
        else kotak.textContent = `Menampilkan ${jumlah} dari ${kartu.length} ${satuan}`;
      }
    },
    [kartuSelector, kosong.judul, kosong.pesan, satuan, statusAttribute, targetId],
  );

  useEffect(() => {
    terapkan("", "");
  }, [terapkan]);

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
    document.getElementById(`cari-${targetId}`)?.focus();
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
