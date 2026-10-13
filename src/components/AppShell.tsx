"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  IconBell,
  IconChevronRight,
  IconDashboard,
  IconDisposition,
  IconLink,
  IconMailIn,
  IconMailOut,
  IconMenu,
  IconSettings,
  IconShield,
  IconTag,
  IconUsers,
} from "@/components/Icons";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
};

type AppShellProps = {
  children: ReactNode;
  institutionName: string;
  institutionArea: string;
  letterCode: string;
  user: string;
  role: string;
  pendingDispositions: number;
  today: string;
};

export default function AppShell({
  children,
  institutionName,
  institutionArea,
  letterCode,
  user,
  role,
  pendingDispositions,
  today,
}: AppShellProps) {
  const pathname = usePathname();
  const [terbuka, setTerbuka] = useState(false);

  const menuUtama: NavItem[] = [
    { href: "/", label: "Dashboard", icon: <IconDashboard size={17} /> },
    { href: "/surat-masuk", label: "Surat Masuk", icon: <IconMailIn size={17} /> },
    { href: "/surat-keluar", label: "Surat Keluar", icon: <IconMailOut size={17} /> },
    {
      href: "/disposisi",
      label: "Disposisi",
      icon: <IconDisposition size={17} />,
      badge: pendingDispositions || undefined,
    },
  ];

  const menuMaster: NavItem[] = [
    { href: "/klasifikasi", label: "Klasifikasi Surat", icon: <IconTag size={17} /> },
    { href: "/pegawai", label: "Data Pegawai", icon: <IconUsers size={17} /> },
    { href: "/pengaturan", label: "Pengaturan", icon: <IconSettings size={17} /> },
  ];

  function aktif(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const semuaMenu = [...menuUtama, ...menuMaster];
  const sekarang = semuaMenu.find((item) => aktif(item.href));

  const judulHalaman: Record<string, { judul: string; remah: string }> = {
    "/": { judul: "Dashboard", remah: "Ringkasan" },
    "/surat-masuk": { judul: "Surat Masuk", remah: "Administrasi" },
    "/surat-keluar": { judul: "Surat Keluar", remah: "Administrasi" },
    "/disposisi": { judul: "Disposisi", remah: "Administrasi" },
    "/klasifikasi": { judul: "Klasifikasi Surat", remah: "Data Master" },
    "/pegawai": { judul: "Data Pegawai", remah: "Data Master" },
    "/pengaturan": { judul: "Pengaturan", remah: "Data Master" },
  };

  const info = judulHalaman[sekarang?.href ?? "/"] ?? { judul: "e-Surat", remah: "Administrasi" };

  function renderLink(item: NavItem) {
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`nav-link${aktif(item.href) ? " active" : ""}`}
        aria-current={aktif(item.href) ? "page" : undefined}
        onClick={() => setTerbuka(false)}
      >
        {item.icon}
        <span>{item.label}</span>
        {item.badge ? <b>{item.badge}</b> : null}
      </Link>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar${terbuka ? " open" : ""}`} id="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            PPK
          </div>
          <div>
            <strong>e-Surat</strong>
            <small>{letterCode}</small>
          </div>
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setTerbuka(false)}
            aria-label="Tutup menu"
          >
            <IconChevronRight size={18} />
          </button>
        </div>

        <div className="side-rule" />

        <p className="nav-caption">MENU UTAMA</p>
        <nav aria-label="Menu utama">{menuUtama.map(renderLink)}</nav>

        <p className="nav-caption master">DATA MASTER</p>
        <nav aria-label="Data master">{menuMaster.map(renderLink)}</nav>

        <div className="sidebar-footer">
          <div className="help-card">
            <span>Portal publik</span>
            <strong>Verifikasi keaslian surat</strong>
            <Link href="/verifikasi" className="text-button">
              <IconLink size={12} /> Buka portal
            </Link>
          </div>
          <div className="user-mini">
            <div className="avatar" aria-hidden="true">
              {user
                .split(" ")
                .map((bagian) => bagian[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <strong>{user}</strong>
              <small>{role}</small>
            </div>
            <span className="online-dot" aria-hidden="true" />
          </div>
        </div>
      </aside>

      {terbuka ? (
        <button
          type="button"
          className="backdrop"
          onClick={() => setTerbuka(false)}
          aria-label="Tutup menu"
        />
      ) : null}

      <div className="content-wrap">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu"
              onClick={() => setTerbuka(true)}
              aria-label="Buka menu"
              aria-expanded={terbuka}
              aria-controls="sidebar"
            >
              <IconMenu size={22} />
            </button>
            <div>
              <p className="breadcrumb">
                {institutionArea} <span>/</span> {info.remah}
              </p>
              <h1>{info.judul}</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <span className="today">{today}</span>
            <button type="button" className="icon-button notification" aria-label="Notifikasi">
              <IconBell size={17} />
              {pendingDispositions > 0 ? <i aria-hidden="true" /> : null}
            </button>
            <div className="header-user">
              <div className="avatar" aria-hidden="true">
                {user
                  .split(" ")
                  .map((bagian) => bagian[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <strong>{user}</strong>
                <small>Online</small>
              </div>
            </div>
            <Link href="/verifikasi" className="icon-button" aria-label="Portal verifikasi">
              <IconShield size={17} />
            </Link>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>

      {/*
        Blok cetak ditempelkan lewat portal langsung ke elemen .app-shell
        (lihat components/PrintPortal.tsx) supaya selektor anak langsung
        pada aturan @media print di globals.css cocok.
      */}
    </div>
  );
}
