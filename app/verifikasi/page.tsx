import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { outgoingLetters } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { formatDate, formatDateTime } from "@/lib/format";
import { IconAlert, IconClock, IconSearch } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verifikasi Dokumen | e-Surat Satpol PP & Damkar Trenggalek",
  description: "Periksa keaslian surat yang diterbitkan Satpol PP dan Damkar Kabupaten Trenggalek.",
};

/** Kode dibuat dari himpunan ini; 0/O dan 1/I sengaja tidak dipakai. */
const POLA_KODE = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/;

type Surat = typeof outgoingLetters.$inferSelect;

type Hasil =
  | { keadaan: "ditemukan"; surat: Surat }
  | { keadaan: "tidak-ditemukan"; formatSesuai: boolean }
  | { keadaan: "sistem-gangguan" };

/** Rapikan ketikan pengguna: buang spasi/tanda, jadikan huruf besar. */
function normalkan(kode: string) {
  return kode.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 32);
}

async function cariSurat(kode: string): Promise<Hasil> {
  try {
    const [row] = await db
      .select()
      .from(outgoingLetters)
      .where(eq(outgoingLetters.verificationCode, kode))
      .limit(1);

    if (row) return { keadaan: "ditemukan", surat: row };
    return { keadaan: "tidak-ditemukan", formatSesuai: POLA_KODE.test(kode) };
  } catch (error) {
    // Jangan sembunyikan penyebabnya: admin perlu tahu basis data bermasalah.
    console.error("[verifikasi] gagal menghubungi basis data:", error);
    return { keadaan: "sistem-gangguan" };
  }
}

export default async function VerifyLetterPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code = "" } = await searchParams;
  const kode = normalkan(code);
  const [settings, hasil] = await Promise.all([
    getSettings(),
    kode ? cariSurat(kode) : Promise.resolve(null),
  ]);

  const surat = hasil?.keadaan === "ditemukan" ? hasil.surat : null;

  return (
    <main className="verify-shell">
      <section className="verify-card">
        <div className="verify-seal" aria-hidden="true">
          ✓
        </div>
        <p className="eyebrow">PORTAL VERIFIKASI DOKUMEN</p>
        <h1>{settings.institution_name}</h1>
        <p className="verify-area">{settings.institution_area}</p>

        <div role="status" aria-live="polite">
          {!hasil ? (
            <div className="verify-status is-neutral">
              <span aria-hidden="true">?</span>
              MASUKKAN KODE VERIFIKASI
            </div>
          ) : hasil.keadaan === "ditemukan" ? (
            <div className="verify-status is-valid">
              <span aria-hidden="true">✓</span>
              DOKUMEN TERDAFTAR &amp; VALID
            </div>
          ) : hasil.keadaan === "tidak-ditemukan" ? (
            <div className="verify-status is-invalid">
              <span aria-hidden="true">!</span>DOKUMEN TIDAK DITEMUKAN
            </div>
          ) : (
            <div className="verify-status is-warning">
              <span aria-hidden="true">!</span>
              SISTEM VERIFIKASI SEDANG GANGGUAN
            </div>
          )}
        </div>

        {!hasil ? (
          <p className="verify-copy">
            Pindai QR code yang tercetak di surat, atau ketik kode verifikasi di bawah ini untuk
            memeriksa keaslian dokumen.
          </p>
        ) : hasil.keadaan === "ditemukan" && surat ? (
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
        ) : hasil.keadaan === "tidak-ditemukan" ? (
          <>
            <p className="verify-copy">
              Kode <strong>{kode}</strong> tidak terdaftar. Surat mungkin belum tercatat di sistem,
              atau kodenya salah ketik. Hubungi Tata Usaha untuk konfirmasi.
            </p>
            {!hasil.formatSesuai ? (
              <p className="verify-hint">
                <IconAlert size={13} />
                Kode verifikasi terdiri dari 8 karakter huruf dan angka — tanpa huruf O, huruf I,
                angka 0, dan angka 1. Periksa kembali penulisannya.
              </p>
            ) : null}
          </>
        ) : (
          <>
            <p className="verify-copy">
              Kode <strong>{kode}</strong> belum bisa diperiksa karena penghubung ke basis data
              sedang tidak tersedia. Ini gangguan di sisi sistem, bukan penilaian atas keaslian
              surat Anda.
            </p>
            <p className="verify-hint">
              <IconClock size={13} />
              Coba periksa lagi beberapa saat lagi, atau kirimkan kode beserta foto surat ke Tata
              Usaha untuk diperiksa manual.
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
              aria-describedby="petunjuk-kode"
              maxLength={32}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              autoFocus={!kode}
              style={{ textTransform: "uppercase" }}
            />
          </label>
          <button type="submit" className="button primary" style={{ minHeight: 40 }}>
            Periksa
          </button>
        </form>

        {hasil?.keadaan === "sistem-gangguan" || hasil?.keadaan === "tidak-ditemukan" ? (
          <p className="verify-footnote" style={{ marginTop: -8 }}>
            <Link href={`/verifikasi?code=${kode}`} className="verify-back" style={{ padding: "6px 10px" }}>
              Coba periksa lagi
            </Link>
          </p>
        ) : null}

        <p className="verify-footnote" id="petunjuk-kode">
          Validasi digital · {formatDateTime(new Date())} WIB
        </p>
        <Link href="/" className="verify-back">
          Kembali ke e-Surat
        </Link>
      </section>
    </main>
  );
}
