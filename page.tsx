import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appSettings, outgoingLetters } from "@/db/schema";

export const dynamic = "force-dynamic";

function formatDate(value: string | Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export default async function VerifyLetterPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code = "" } = await searchParams;
  const [settingsRows, letter] = await Promise.all([
    db.select().from(appSettings),
    code ? db.select().from(outgoingLetters).where(eq(outgoingLetters.verificationCode, code)).limit(1).then((rows) => rows[0]) : Promise.resolve(undefined),
  ]);
  const settings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value]));
  const institution = settings.institution_name ?? "SATPOL PP DAN PEMADAM KEBAKARAN";

  return (
    <main className="verify-shell">
      <section className="verify-card">
        <div className="verify-seal" aria-hidden="true">✓</div>
        <p className="eyebrow">PORTAL VERIFIKASI DOKUMEN</p>
        <h1>{institution}</h1>
        <p className="verify-area">{settings.institution_area ?? "KABUPATEN TRENGGALEK"}</p>
        <div className={`verify-status ${letter ? "is-valid" : "is-invalid"}`}>
          <span>{letter ? "✓" : "!"}</span>
          {letter ? "DOKUMEN TERDAFTAR & VALID" : "DOKUMEN TIDAK DITEMUKAN"}
        </div>
        {letter ? (
          <dl className="verify-data">
            <div><dt>Nomor surat</dt><dd>{letter.officialNumber}</dd></div>
            <div><dt>Perihal</dt><dd>{letter.subject}</dd></div>
            <div><dt>Tanggal surat</dt><dd>{formatDate(letter.letterDate)}</dd></div>
            <div><dt>Penandatangan</dt><dd>{letter.signer}</dd></div>
            <div><dt>Status arsip</dt><dd>{letter.archiveStatus}</dd></div>
          </dl>
        ) : (
          <p className="verify-copy">Kode verifikasi tidak sah atau surat belum tercatat di sistem. Silakan hubungi Tata Usaha untuk konfirmasi.</p>
        )}
        <p className="verify-footnote">Validasi digital · {new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date())} WIB</p>
        <Link href="/" className="verify-back">Kembali ke e-Surat</Link>
      </section>
    </main>
  );
}
