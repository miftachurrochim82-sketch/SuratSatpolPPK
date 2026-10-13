import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "e-Surat | Satpol PP & Damkar Trenggalek",
  description: "Sistem manajemen surat masuk, surat keluar, disposisi, dan verifikasi dokumen digital.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
