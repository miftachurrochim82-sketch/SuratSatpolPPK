"use client";

import { useSyncExternalStore } from "react";

/**
 * Alamat halaman (query string) sebagai sumber kebenaran saringan: kata kunci,
 * pilihan saringan, urutan kolom, dan nomor halaman.
 *
 * Dibaca lewat useSyncExternalStore supaya:
 *  - render di server dan render pertama di browser sama (tanpa ketidakcocokan
 *    hidrasi), lalu nilainya menyusul setelah hidrasi; dan
 *  - tidak perlu setState di dalam effect (aturan eslint repo ini).
 *
 * Dibaca-tulis lewat replaceState, jadi setiap ketikan tidak menumpuk riwayat
 * "Kembali" di browser — tetapi hasil saringan tetap bisa disalin dan dibuka
 * orang lain, karena seluruh keadaan ada di alamatnya.
 */

const PENDENGAR = new Set<() => void>();

function beritahu() {
  PENDENGAR.forEach((fn) => fn());
}

export function langgananUrl(pendengar: () => void) {
  PENDENGAR.add(pendengar);
  window.addEventListener("popstate", pendengar);
  return () => {
    PENDENGAR.delete(pendengar);
    window.removeEventListener("popstate", pendengar);
  };
}

export function cuplikanUrl() {
  return window.location.search;
}

/** Saat render di server belum ada alamat: dianggap tanpa saringan. */
export function cuplikanUrlServer() {
  return "";
}

export function useKueri() {
  return useSyncExternalStore(langgananUrl, cuplikanUrl, cuplikanUrlServer);
}

export function param(pencarian: string, nama: string) {
  return new URLSearchParams(pencarian).get(nama) ?? "";
}

export function angkaParam(pencarian: string, nama: string, cadangan: number) {
  const nilai = Number(param(pencarian, nama));
  return Number.isFinite(nilai) && nilai > 0 ? nilai : cadangan;
}

/**
 * Menulis beberapa parameter sekaligus. Nilai kosong berarti parameter dihapus,
 * supaya alamat tetap pendek saat saringan dibersihkan.
 */
export function tulis(ubah: Record<string, string>) {
  const url = new URL(window.location.href);
  Object.entries(ubah).forEach(([nama, nilai]) => {
    if (nilai) url.searchParams.set(nama, nilai);
    else url.searchParams.delete(nama);
  });
  window.history.replaceState(null, "", url.toString());
  beritahu();
}
