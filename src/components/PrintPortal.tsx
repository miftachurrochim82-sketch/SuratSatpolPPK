"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

function cariWadahCetak(): Element | null {
  if (typeof document === "undefined") return null;
  return document.querySelector(".app-shell");
}

/**
 * Menempelkan isi cetak sebagai ANAK LANGSUNG dari .app-shell.
 *
 * Aturan @media print di globals.css:
 *   .app-shell > *:not(.print-disposition) { display: none !important; }
 *   .print-disposition { display: block !important; }
 *
 * Karena selektornya memakai anak langsung (>), blok cetak harus di-portal ke
 * .app-shell itu sendiri — bukan ke dalam .page-content, karena kalau di dalam
 * ia akan ikut tersembunyi saat dicetak.
 *
 * Wadah diambil sekali saat komponen pertama dirender di browser. Ini aman karena
 * isi cetak hanya muncul setelah pengguna menekan tombol, jadi tidak pernah
 * dirender saat server-side rendering maupun hidrasi.
 */
export default function PrintPortal({ children }: { children: ReactNode }) {
  const [target] = useState<Element | null>(cariWadahCetak);

  if (!target) return null;
  return createPortal(children, target);
}
