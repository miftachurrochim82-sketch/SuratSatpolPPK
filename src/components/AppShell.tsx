"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useSyncExternalStore, useState, type ReactNode } from "react";
import {
  IconBell,
  IconChevronRight,
  IconDashboard,
  IconDisposition,
  IconLink,
  IconLogout,
  IconMailIn,
  IconMailOut,
  IconMenu,
  IconSettings,
  IconShield,
  IconSidebarCollapse,
  IconSidebarExpand,
  IconTag,
  IconUserPlus,
  IconUsers,
} from "@/components/Icons";
import { definisiPeran, labelPeran, menuBoleh } from "@/lib/permissions";
import { logout } from "@/actions/auth";

const KUNCI_SIMPAN = "esurat-sidebar";
const NAMA_KEJADIAN = "esurat-sidebar-berubah";

/**
 * Menyimpan pilihan lebar sidebar di localStorage.
 *
 * Dipakai useSyncExternalStore — bukan useEffect + setState — supaya tidak
 * memicu render berantai, dan supaya hasil render server (lebar) dengan klien
 * tetap konsisten saat hidrasi.
 */
function useLebarSidebar() {
  const sempit = useSyncExternalStore(
    (beritahu) => {
      window.addEventListener(NAMA_KEJADIAN, beritahu);
      window.addEventListener("storage", beritahu);
      return () => {
        window.removeEventListener(NAMA_KEJADIAN, beritahu);
        window.removeEventListener("storage", beritahu);
      };
    },
    () => window.localStorage.getItem(KUNCI_SIMPAN) === "sempit",
    () => false,
  );

  const ubah = useCallback((nilai: boolean) => {
    window.localStorage.setItem(KUNCI_SIMPAN, nilai ? "sempit" : "lebar");
    window.dispatchEvent(new Event(NAMA_KEJADIAN));
  }, []);

  return [sempit, ubah] as const;
}

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
};

export type DisposisiMenunggu = {
  id: string;
  subject: string;
  letterNumber: string;
  staffName: string;
  dueDate: string | null;
};

type AppShellProps = {
  children: ReactNode;
  institutionArea: string;
  letterCode: string;
  user: { name: string; username: string; role: string };
  pendingDispositions: number;
  /** beberapa disposisi terbaru yang menunggu, untuk panel notifikasi */
  dispositionsWaiting: DisposisiMenunggu[];
  today: string;
};

const JUDUL: Record<string, { judul: string; remah: string }> = {
  "/": { judul: "Dashboard", remah: "Ringkasan" },
  "/surat-masuk": { judul: "Surat Masuk", remah: "Administrasi" },
  "/surat-keluar": { judul: "Surat Keluar", remah: "Administrasi" },
  "/disposisi": { judul: "Disposisi", remah: "Administrasi" },
  "/klasifikasi": { judul: "Klasifikasi Surat", remah: "Data Master" },
  "/pegawai": { judul: "Data Pegawai", remah: "Data Master" },
  "/pengguna": { judul: "Pengguna Sistem", remah: "Data Master" },
  "/pengaturan": { judul: "Pengaturan", remah: "Data Master" },
};

export default function AppShell({
  children,
  institutionArea,
  letterCode,
  user,
  pendingDispositions,
  dispositionsWaiting,
  today,
}: AppShellProps) {
  const pathname = usePathname();
  const [laciTerbuka, setLaciTerbuka] = useState(false);
  const [notifTerbuka, setNotifTerbuka] = useState(false);
  /* fokus harus berpindah ke panel saat dibuka, lalu kembali ke lonceng saat ditutup */
  const lonceng = useRef<HTMLButtonElement>(null);
  const tombolTutupNotif = useRef<HTMLButtonElement>(null);
  const [sempit, setSempit] = useLebarSidebar();

  // panel notifikasi: fokus pindah ke dalam, ditutup dengan Esc atau klik di luarnya
  useEffect(() => {
    if (!notifTerbuka) return;
    tombolTutupNotif.current?.focus();
    const lewatPapanTik = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotifTerbuka(false);
        lonceng.current?.focus();
      }
    };
    const klikDiLuar = (event: MouseEvent) => {
      const wadah = document.querySelector(".notif-wrap");
      if (wadah && !wadah.contains(event.target as Node)) {
        setNotifTerbuka(false);
        lonceng.current?.focus();
      }
    };
    document.addEventListener("keydown", lewatPapanTik);
    document.addEventListener("mousedown", klikDiLuar);
    return () => {
      document.removeEventListener("keydown", lewatPapanTik);
      document.removeEventListener("mousedown", klikDiLuar);
    };
  }, [notifTerbuka]);

  const boleh = menuBoleh(user.role);
  const singkatanPeran = definisiPeran(user.role).singkat;

  const menuUtama: NavItem[] = [
    { href: "/", label: "Dashboard", icon: <IconDashboard size={17} /> },
    ...(boleh.surat
      ? [
          { href: "/surat-masuk", label: "Surat Masuk", icon: <IconMailIn size={17} /> },
          { href: "/surat-keluar", label: "Surat Keluar", icon: <IconMailOut size={17} /> },
        ]
      : []),
    {
      href: "/disposisi",
      label: "Disposisi",
      icon: <IconDisposition size={17} />,
      badge: pendingDispositions || undefined,
    },
  ];

  const menuMaster: NavItem[] = [
    ...(boleh.master
      ? [
          { href: "/klasifikasi", label: "Klasifikasi Surat", icon: <IconTag size={17} /> },
          { href: "/pegawai", label: "Data Pegawai", icon: <IconUsers size={17} /> },
        ]
      : []),
    ...(boleh.pengguna
      ? [{ href: "/pengguna", label: "Pengguna Sistem", icon: <IconUserPlus size={17} /> }]
      : []),
    ...(boleh.pengaturan
      ? [{ href: "/pengaturan", label: "Pengaturan", icon: <IconSettings size={17} /> }]
      : []),
  ];

  function aktif(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const info = JUDUL[pathname] ?? { judul: "e-Surat", remah: "Administrasi" };
  const inisial = user.name
    .split(/\s+/)
    .filter(Boolean)
    .map((bagian) => bagian[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function renderLink(item: NavItem) {
    const iniAktif = aktif(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`nav-link${iniAktif ? " active" : ""}`}
        aria-current={iniAktif ? "page" : undefined}
        aria-label={item.label}
        title={sempit ? item.label : undefined}
        onClick={() => setLaciTerbuka(false)}
      >
        {item.icon}
        <span>{item.label}</span>
        {item.badge ? <b>{item.badge}</b> : null}
      </Link>
    );
  }

  return (
    <div className={`app-shell${sempit ? " sempit" : ""}`}>
      <aside className={`sidebar${laciTerbuka ? " open" : ""}`} id="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            PPK
          </div>
          <div className="brand-teks">
            <strong>e-Surat</strong>
            <small>{letterCode}</small>
          </div>
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setLaciTerbuka(false)}
            aria-label="Tutup menu"
          >
            <IconChevronRight size={18} />
          </button>
        </div>

        <div className="side-rule" />

        <p className="nav-caption">MENU UTAMA</p>
        <nav aria-label="Menu utama">{menuUtama.map(renderLink)}</nav>

        {menuMaster.length > 0 ? (
          <>
            <p className="nav-caption master">DATA MASTER</p>
            <nav aria-label="Data master">{menuMaster.map(renderLink)}</nav>
          </>
        ) : null}

        <div className="sidebar-footer">
          <div className="help-card">
            <span>Portal publik</span>
            <strong>Verifikasi keaslian surat</strong>
            <Link href="/verifikasi" className="text-button" title="Buka portal verifikasi">
              <IconLink size={12} /> <span>Buka portal</span>
            </Link>
          </div>

          <div className="user-mini">
            <div className="avatar" aria-hidden="true" title={user.name}>
              {inisial}
            </div>
            <div className="user-teks">
              <strong>{user.name}</strong>
              <small>{singkatanPeran}</small>
            </div>
            <span className="online-dot" aria-hidden="true" />
            <form action={logout} className="keluar-form">
              <button type="submit" className="keluar-button" title="Keluar" aria-label="Keluar">
                <IconLogout size={14} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {laciTerbuka ? (
        <button
          type="button"
          className="backdrop"
          onClick={() => setLaciTerbuka(false)}
          aria-label="Tutup menu"
        />
      ) : null}

      <div className="content-wrap">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu"
              onClick={() => setLaciTerbuka(true)}
              aria-label="Buka menu"
              aria-expanded={laciTerbuka}
              aria-controls="sidebar"
            >
              <IconMenu size={22} />
            </button>
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setSempit(!sempit)}
              aria-label={sempit ? "Lebarkan sidebar" : "Perkecil sidebar"}
              aria-expanded={!sempit}
              title={sempit ? "Lebarkan sidebar" : "Perkecil sidebar"}
            >
              {sempit ? <IconSidebarExpand size={18} /> : <IconSidebarCollapse size={18} />}
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
            <div className="notif-wrap">
              <button
                type="button"
                className="icon-button notification"
                aria-label={`Disposisi menunggu: ${pendingDispositions}`}
                aria-expanded={notifTerbuka}
                aria-haspopup="dialog"
                ref={lonceng}
                onClick={() => {
                  const jadi = !notifTerbuka;
                  setNotifTerbuka(jadi);
                  if (!jadi) lonceng.current?.focus();
                }}
              >
                <IconBell size={17} />
                {pendingDispositions > 0 ? <i aria-hidden="true" /> : null}
              </button>

              {notifTerbuka ? (
                <div className="notif-panel" role="dialog" aria-label="Disposisi menunggu">
                  <div className="notif-head">
                    <strong>{pendingDispositions} disposisi menunggu</strong>
                    <button
                      type="button"
                      className="modal-close"
                      aria-label="Tutup pemberitahuan"
                      ref={tombolTutupNotif}
                      onClick={() => {
                        setNotifTerbuka(false);
                        lonceng.current?.focus();
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  {dispositionsWaiting.length === 0 ? (
                    <p className="notif-empty">Tidak ada disposisi yang menunggu tindak lanjut.</p>
                  ) : (
                    <ul className="notif-list">
                      {dispositionsWaiting.map((item) => (
                        <li key={item.id}>
                          <strong>{item.subject}</strong>
                          <span>
                            {item.letterNumber} · kepada {item.staffName}
                            {item.dueDate ? ` · batas ${item.dueDate}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href="/disposisi?status=Pending"
                    className="text-button"
                    onClick={() => setNotifTerbuka(false)}
                  >
                    Lihat semua disposisi pending
                  </Link>
                </div>
              ) : null}
            </div>
            <div className="header-user">
              <div className="avatar" aria-hidden="true">
                {inisial}
              </div>
              <div>
                <strong>{user.name}</strong>
                <small>{labelPeran(user.role)}</small>
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
