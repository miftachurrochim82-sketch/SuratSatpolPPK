import Link from "next/link";
import { getDashboardData } from "@/lib/queries";
import { getSettings, isDatabaseReady } from "@/lib/settings";
import { wajibMasuk } from "@/lib/auth";
import { formatDateShort } from "@/lib/format";
import {
  IconAlert,
  IconChevronRight,
  IconClock,
  IconDisposition,
  IconFile,
  IconInfo,
  IconMailIn,
  IconMailOut,
  IconShield,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

const TINGGI_GRAFIK = 118;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ izin?: string }>;
}) {
  const [pengguna, { izin }] = await Promise.all([wajibMasuk(), searchParams]);

  const [data, settings, dbSiap] = await Promise.all([
    getDashboardData(pengguna),
    getSettings(),
    isDatabaseReady(),
  ]);

  const puncak = Math.max(
    1,
    ...data.grafik.map((titik) => titik.masuk + titik.keluar + titik.disposisi),
  );
  const skala = [puncak, Math.round(puncak * 0.66), Math.round(puncak * 0.33), 0];

  const kartu = [
    {
      kelas: "navy",
      label: "Surat Masuk",
      nilai: data.totalMasuk,
      catatan: `${data.suratMasukBulanIni} bulan ini`,
      ikon: <IconMailIn size={20} />,
    },
    {
      kelas: "sky",
      label: "Surat Keluar",
      nilai: data.totalKeluar,
      catatan: "tercatat di arsip",
      ikon: <IconMailOut size={20} />,
    },
    {
      kelas: "amber",
      label: "Disposisi Pending",
      nilai: data.disposisiPending,
      catatan: `${data.disposisiSelesai} sudah selesai`,
      ikon: <IconClock size={20} />,
    },
    {
      kelas: "green",
      label: "Belum Didisposisi",
      nilai: data.belumDidisposisi,
      catatan: "surat masuk menunggu",
      ikon: <IconDisposition size={20} />,
    },
  ];

  return (
    <>
      {izin === "ditolak" ? (
        <p className="notification-note" role="alert" style={{ marginBottom: 18 }}>
          <IconAlert size={15} />
          <span>
            <strong>Akses ditolak.</strong> Peran Anda tidak punya izin untuk membuka halaman
            itu. Hubungi administrator bila merasa ini keliru.
          </span>
        </p>
      ) : null}

      {!dbSiap ? (
        <p className="notification-note" style={{ marginBottom: 18 }} role="alert">
          <IconAlert size={15} />
          <span>
            <strong>Database belum tersambung.</strong> Halaman ini tampil dengan data kosong.
            Periksa nilai <code>DATABASE_URL</code> di berkas <code>.env</code>, lalu jalankan{" "}
            <code>npm run db:migrate</code>.
          </span>
        </p>
      ) : null}

      <section className="welcome">
        <div>
          <p className="eyebrow">RINGKASAN HARI INI</p>
          <h2>
            Selamat bertugas di <span>e-Surat</span>
          </h2>
          <p>
            Kelola surat masuk, surat keluar, dan disposisi dalam satu tempat terpadu.
          </p>
        </div>
        <Link href="/surat-masuk" className="button primary">
          <IconMailIn size={15} /> Catat Surat Masuk
        </Link>
      </section>

      <section className="stat-grid">
        {kartu.map((item) => (
          <article className={`stat-card ${item.kelas}`} key={item.label}>
            <div className="stat-icon" aria-hidden="true">
              {item.ikon}
            </div>
            <div>
              <p>{item.label}</p>
              <strong>{item.nilai}</strong>
              <span>{item.catatan}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel activity-panel">
          <div className="panel-head">
            <div>
              <h3>Aktivitas Surat</h3>
              <p>Perbandingan surat masuk dan keluar enam bulan terakhir</p>
            </div>
            <span className="month-chip">6 bulan</span>
          </div>

          <div className="chart">
            <div className="chart-scale" aria-hidden="true">
              {skala.map((angka) => (
                <span key={angka}>{angka}</span>
              ))}
            </div>
            <div className="chart-bars">
              {data.grafik.map((titik) => {
                const tinggi = (nilai: number) =>
                  nilai === 0 ? 0 : Math.max(6, Math.round((nilai / puncak) * TINGGI_GRAFIK));
                return (
                  <div className="bar-col" key={titik.label}>
                    <div className="bar navy" style={{ height: tinggi(titik.masuk) }}>
                      <span>{titik.masuk}</span>
                    </div>
                    <div className="bar sky" style={{ height: tinggi(titik.keluar) }}>
                      <span>{titik.keluar}</span>
                    </div>
                    <div className="bar amber" style={{ height: tinggi(titik.disposisi) }}>
                      <span>{titik.disposisi}</span>
                    </div>
                    <small>{titik.label}</small>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="chart-legend">
            <span>
              <i className="dot navy" /> Surat masuk
            </span>
            <span>
              <i className="dot sky" /> Surat keluar
            </span>
            <span>
              <i className="dot amber" /> Disposisi
            </span>
          </div>
        </article>

        <article className="panel institution-panel">
          <div className="institution-top">
            <div className="crest" aria-hidden="true">
              PPK
            </div>
            <div>
              <p className="eyebrow">PROFIL INSTANSI</p>
              <h3>{settings.institution_name}</h3>
              <p>{settings.institution_area}</p>
            </div>
          </div>

          <div className="institution-list">
            <div>
              <span>Kepala</span>
              <strong>{settings.head_name}</strong>
            </div>
            <div>
              <span>Kode surat</span>
              <strong>{settings.letter_code}</strong>
            </div>
            <div>
              <span>Telepon</span>
              <strong>{settings.institution_phone}</strong>
            </div>
            <div>
              <span>Surel</span>
              <strong style={{ wordBreak: "break-all" }}>{settings.institution_email}</strong>
            </div>
            <div>
              <span>Status sistem</span>
              <strong className={dbSiap ? "system-ok" : ""}>
                {dbSiap ? (
                  <>
                    <i aria-hidden="true" /> Database terhubung
                  </>
                ) : (
                  "Database terputus"
                )}
              </strong>
            </div>
            <div>
              <span>WhatsApp</span>
              <strong>{settings.wa_status}</strong>
            </div>
          </div>

          <p className="system-note">
            <IconInfo size={13} />
            <span>
              Ubah identitas instansi di halaman <Link href="/pengaturan">Pengaturan</Link>.
            </span>
          </p>
        </article>
      </section>

      <section className="panel recent-panel">
        <div className="panel-head">
          <div>
            <h3>Surat Terbaru</h3>
            <p>Lima berkas terakhir yang tercatat</p>
          </div>
          <Link href="/surat-masuk" className="text-button">
            Lihat semua <IconChevronRight size={12} />
          </Link>
        </div>

        {data.terbaru.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              <IconFile size={20} />
            </div>
            <strong>Belum ada surat tercatat</strong>
            <p>
              Mulai dengan mencatat surat masuk pertama. Data akan langsung muncul di sini
              beserta ringkasannya.
            </p>
            <Link href="/surat-masuk" className="button primary small">
              <IconMailIn size={13} /> Catat Surat Masuk
            </Link>
          </div>
        ) : (
          <div className="recent-list">
            {data.terbaru.map((item) => (
              <div className="recent-row" key={`${item.jenis}-${item.nomor}-${item.tanggal}`}>
                <div className="letter-icon" aria-hidden="true">
                  {item.jenis === "masuk" ? <IconMailIn size={15} /> : <IconMailOut size={15} />}
                </div>
                <div className="recent-main">
                  <strong>{item.perihal}</strong>
                  <span>
                    {item.nomor} · {item.pihak}
                  </span>
                </div>
                <span className={`status-pill ${item.jenis === "masuk" ? "amber" : "sky"}`}>
                  <i aria-hidden="true" />
                  {item.jenis === "masuk" ? "Masuk" : "Keluar"}
                </span>
                <span className="recent-date">{formatDateShort(item.tanggal)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="system-note" style={{ marginTop: 16, justifyContent: "center" }}>
        <IconShield size={13} />
        <span>
          Portal verifikasi publik tersedia di <Link href="/verifikasi">/verifikasi</Link> —
          bagikan tautannya agar pihak luar dapat memeriksa keaslian surat.
        </span>
      </p>
    </>
  );
}
