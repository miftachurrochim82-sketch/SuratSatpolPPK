"use client";

import { useState, type ChangeEvent } from "react";
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
};

/**
 * Menyaring baris tabel yang sudah dirender server, langsung di browser.
 * Tidak perlu query ulang ke database supaya terasa instan.
 */
export default function TableFilter({
  placeholder,
  targetId,
  rowSelector = "tr",
  options,
  filterLabel = "Semua klasifikasi",
  filterAttribute = "data-kode",
}: TableFilterProps) {
  const [kata, setKata] = useState("");
  const [pilihan, setPilihan] = useState("");

  function terapkan(teks: string, kode: string) {
    const tbody = document.getElementById(targetId);
    if (!tbody) return;
    const cari = teks.trim().toLowerCase();

    tbody.querySelectorAll<HTMLTableRowElement>(rowSelector).forEach((baris) => {
      // baris kosong (empty-state) selalu disembunyikan saat ada filter aktif
      if (baris.dataset.empty === "true") {
        baris.style.display = cari || kode ? "none" : "";
        return;
      }
      const cocokTeks = !cari || (baris.textContent ?? "").toLowerCase().includes(cari);
      const cocokKode = !kode || (baris.getAttribute(filterAttribute) ?? "") === kode;
      baris.style.display = cocokTeks && cocokKode ? "" : "none";
    });

    // tampilkan baris "tidak ada hasil" bila seluruh baris tersembunyi
    const terlihat = Array.from(
      tbody.querySelectorAll<HTMLTableRowElement>(rowSelector),
    ).filter((baris) => baris.dataset.empty !== "true" && baris.style.display !== "none");

    const penanda = tbody.querySelector<HTMLTableRowElement>('tr[data-empty="true"]');
    if (penanda) penanda.style.display = terlihat.length === 0 ? "" : "none";
  }

  function ubahTeks(event: ChangeEvent<HTMLInputElement>) {
    setKata(event.target.value);
    terapkan(event.target.value, pilihan);
  }

  function ubahPilihan(event: ChangeEvent<HTMLSelectElement>) {
    setPilihan(event.target.value);
    terapkan(kata, event.target.value);
  }

  return (
    <div className="table-controls">
      <label className="search-field">
        <IconSearch size={14} />
        <input
          type="search"
          value={kata}
          onChange={ubahTeks}
          placeholder={placeholder}
          aria-label={placeholder}
        />
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
    </div>
  );
}
