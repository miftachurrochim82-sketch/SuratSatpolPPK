import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { penggunaSaatIni } from "@/lib/auth";
import { PERAN, DEFINISI } from "@/lib/permissions";
import { getSettings, isDatabaseReady } from "@/lib/settings";
import { IconAlert, IconInfo, IconShield } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk | e-Surat Satpol PP & Damkar Trenggalek",
  description: "Halaman masuk petugas untuk sistem administrasi surat.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // sudah masuk? langsung ke tujuan
  const pengguna = await penggunaSaatIni();
  if (pengguna) redirect("/");

  const [settings, dbSiap] = await Promise.all([getSettings(), isDatabaseReady()]);
  const tujuan = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <main className="verify-shell">
      <section className="verify-card" style={{ maxWidth: 470, textAlign: "left" }}>
        <div style={{ textAlign: "center" }}>
          <div className="verify-seal" aria-hidden="true">
            ✓
          </div>
          <p className="eyebrow">SISTEM ADMINISTRASI SURAT</p>
          <h1>{settings.institution_name}</h1>
          <p className="verify-area">{settings.institution_area}</p>
        </div>

        {!dbSiap ? (
          <p className="notification-note" role="alert" style={{ marginBottom: 16 }}>
            <IconAlert size={14} />
            <span>
              <strong>Database belum tersambung.</strong> Masuk tidak akan berhasil sebelum{" "}
              <code>DATABASE_URL</code> diisi dan <code>npm run db:migrate</code> dijalankan.
            </span>
          </p>
        ) : null}

        <LoginForm next={tujuan} />

        <p className="verify-footnote" style={{ marginTop: 20, marginBottom: 8 }}>
          Gunakan akun yang diberikan administrator Tata Usaha.
        </p>

        <Link href="/verifikasi" className="verify-back">
          <IconShield size={13} /> Portal verifikasi dokumen
        </Link>

        <details style={{ marginTop: 22 }}>
          <summary
            style={{
              cursor: "pointer",
              color: "#7e8ea1",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".3px",
            }}
          >
            PERAN PENGGUNA &amp; HAK AKSES
          </summary>
          <dl className="verify-data" style={{ marginTop: 12, marginBottom: 0 }}>
            {PERAN.map((peran) => (
              <div key={peran} style={{ gridTemplateColumns: "110px 1fr" }}>
                <dt>{DEFINISI[peran].label}</dt>
                <dd style={{ fontWeight: 400, fontSize: 10, lineHeight: 15 }}>
                  {DEFINISI[peran].keterangan}
                </dd>
              </div>
            ))}
          </dl>
        </details>

        <p
          className="system-note"
          style={{ justifyContent: "center", marginTop: 16, textAlign: "center" }}
        >
          <IconInfo size={12} />
          <span>Akun bawaan dari data contoh: admin · tu · pimpinan. Segera ubah kata sandinya.</span>
        </p>
      </section>
    </main>
  );
}
