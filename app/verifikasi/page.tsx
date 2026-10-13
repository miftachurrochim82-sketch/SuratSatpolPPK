import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { outgoingLetters } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { formatDate, formatDateTime } from "@/lib/format";
import { IconSearch } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verifikasi Dokumen | e-Surat Satpol PP & Damkar Trenggalek",
  description: "Periksa keaslian surat yang diterbitkan Satpol PP dan Damkar Kabupaten Trenggalek.",
};

async function cariSurat(code: string) {
  if (!code) return { surat: null, databaseSiap: true };
  try {
    const [row] = await db
      .select()
      .from(outgoingLetters)
      .where(eq(outgoingLetters.verificationCode, code))
      .limit(1);
    return { surat: row ?? null, databaseSiap: true };
  } catch {
    return { surat: null, databaseSiap: false };
  }
}

export default async function VerifyLetterPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code = "" } = await searchParams;
  const kode = code.trim().toUpperCase();
  const [settings, hasil] = await Promise.all([getSettings(), cariSurat(kode)]);
  const { surat, databaseSiap } = hasil;

  return (
    <main className="verify-shell">
      <section className="verify-card">
        <div className="verify-seal" aria-hidden="true">
          ✓
        </div>
        <p className="eyebrow">PORTAL VERIFIKASI DOKUMEN</p>
        <h1>{settings.institution_name}</h1>
        <p className="verify-area">{settings.institution_area}</p>

        {kode ? (
          <>
            <div className={`verify-status ${surat ? "is-valid" : "is-invalid"}`}>
              <span aria-hidden="true">{surat ? "✓" : "!"}</span>
              {surat ? "DOKUMEN TERDAFTAR & VALID" : "DOKUMEN TIDAK DITEMUKAN"}
            </div>

            {surat ? (
              <dl className="verify-data">
                <div>
                  <dt>Nomor surat</dt>
                  <dd>{surat.officialNumber}</dd>
                </div>
                <div>
                  <dt>Perihal</dt>
                  <dd>{surat.subject}</dd>
                </div>
                <div>
                  <dt>Tanggal surat</dt>
                  <dd>{formatDate(surat.letterDate)}</dd>
                </div>
                <div>
                  <dt>Tujuan</dt>
                  <dd>{surat.recipient}</dd>
                </div>
                <div>
                  <dt>Penandatangan</dt>
                  <dd>{surat.signer}</dd>
                </div>
                <div>
                  <dt>Status arsip</dt>
                  <dd>{surat.archiveStatus}</dd>
                </div>
                <div>
                  <dt>Kode verifikasi</dt>
                  <dd>{surat.verificationCode}</dd>
                </div>
              </dl>
            ) : (
              <p className="verify-copy">
                {databaseSiap
                  ? "Kode verifikasi tidak sah atau surat belum tercatat di sistem. Silakan hubungi Tata Usaha untuk konfirmasi."
                  : "Sistem verifikasi sedang tidak dapat dihubungi. Coba beberapa saat lagi atau hubungi Tata Usaha."}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="verify-status is-invalid" style={{ background: "#f3f7fa", color: "#5b6f86" }}>
              <span aria-hidden="true" style={{ background: "#8ba0b6" }}>
                ?
              </span>
              MASUKKAN KODE VERIFIKASI
            </div>
            <p className="verify-copy">
              Pindai QR code yang tercetak di surat, atau ketik kode verifikasi di bawah ini untuk
              memeriksa keaslian dokumen.
            </p>
          </>
        )}

        <form
          method="get"
          style={{
            display: "flex",
            gap: 8,
            margin: "0 0 18px",
            textAlign: "left",
          }}
        >
          <label className="search-field" style={{ maxWidth: "none" }}>
            <IconSearch size={14} />
            <input
              name="code"
              defaultValue={kode}
              placeholder="Contoh: K7M2P9QX"
              aria-label="Kode verifikasi"
              maxLength={32}
              autoComplete="off"
              style={{ textTransform: "uppercase" }}
            />
          </label>
          <button type="submit" className="button primary" style={{ minHeight: 35 }}>
            Periksa
          </button>
        </form>

        <p className="verify-footnote">
          Validasi digital · {formatDateTime(new Date())} WIB
        </p>
        <Link href="/" className="verify-back">
          Kembali ke e-Surat
        </Link>
      </section>
    </main>
  );
}
