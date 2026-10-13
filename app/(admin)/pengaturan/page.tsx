import Link from "next/link";
import { saveSettings } from "@/actions/master";
import { getSettings, isDatabaseReady, DEFAULT_SETTINGS } from "@/lib/settings";
import FormModal from "@/components/FormModal";
import {
  IconAlert,
  IconInfo,
  IconSettings,
  IconShield,
  IconWhatsapp,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const [settings, dbSiap] = await Promise.all([getSettings(), isDatabaseReady()]);
  const masihBawaan = settings.institution_name === DEFAULT_SETTINGS.institution_name;

  return (
    <>
      {!dbSiap ? (
        <p className="notification-note" style={{ marginBottom: 18 }} role="alert">
          <IconAlert size={15} />
          <span>
            <strong>Database belum tersambung.</strong> Nilai di bawah ini masih memakai
            pengaturan bawaan dan belum bisa disimpan. Periksa <code>DATABASE_URL</code> pada
            berkas <code>.env</code>.
          </span>
        </p>
      ) : null}

      <section className="settings-grid">
        <article className="panel settings-panel">
          <div className="panel-head">
            <div>
              <h3>Identitas Instansi</h3>
              <p>Dipakai pada kop lembar disposisi, portal verifikasi, dan nomor surat</p>
            </div>
            {masihBawaan ? <span className="month-chip">Masih bawaan</span> : null}
          </div>

          <FormModal
            action={saveSettings}
            title="Ubah Identitas Instansi"
            eyebrow="PENGATURAN"
            trigger="Ubah Pengaturan"
            triggerClass="button secondary"
            triggerIcon={<IconSettings size={14} />}
            submitLabel="Simpan pengaturan"
            wide
          >
            <div className="form-grid">
              <label className="field full">
                <span>Nama instansi</span>
                <input
                  name="institution_name"
                  defaultValue={settings.institution_name}
                  maxLength={160}
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>Wilayah</span>
                <input
                  name="institution_area"
                  defaultValue={settings.institution_area}
                  maxLength={120}
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>Kode surat</span>
                <input
                  name="letter_code"
                  defaultValue={settings.letter_code}
                  maxLength={32}
                  autoComplete="off"
                  style={{ textTransform: "uppercase" }}
                />
              </label>

              <label className="field full">
                <span>Alamat</span>
                <input
                  name="institution_address"
                  defaultValue={settings.institution_address}
                  maxLength={200}
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>Telepon</span>
                <input
                  name="institution_phone"
                  defaultValue={settings.institution_phone}
                  maxLength={40}
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>Surel</span>
                <input
                  name="institution_email"
                  type="email"
                  defaultValue={settings.institution_email}
                  maxLength={120}
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>Nama kepala</span>
                <input
                  name="head_name"
                  defaultValue={settings.head_name}
                  maxLength={160}
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>Jabatan kepala</span>
                <input
                  name="head_position"
                  defaultValue={settings.head_position}
                  maxLength={160}
                  autoComplete="off"
                />
              </label>

              <div className="full">
                <div className="notification-note">
                  <IconInfo size={14} />
                  <span>
                    <strong>Kode surat</strong> dipakai saat menyusun nomor resmi surat keluar —
                    contoh format: <code>005/{settings.letter_code}/X/2026</code>.
                  </span>
                </div>
              </div>
            </div>
          </FormModal>

          <dl className="verify-data" style={{ marginTop: 20, marginBottom: 0 }}>
            <div>
              <dt>Nama instansi</dt>
              <dd>{settings.institution_name}</dd>
            </div>
            <div>
              <dt>Wilayah</dt>
              <dd>{settings.institution_area}</dd>
            </div>
            <div>
              <dt>Alamat</dt>
              <dd>{settings.institution_address}</dd>
            </div>
            <div>
              <dt>Telepon</dt>
              <dd>{settings.institution_phone}</dd>
            </div>
            <div>
              <dt>Surel</dt>
              <dd>{settings.institution_email}</dd>
            </div>
            <div>
              <dt>Kepala</dt>
              <dd>
                {settings.head_name} — {settings.head_position}
              </dd>
            </div>
            <div>
              <dt>Kode surat</dt>
              <dd>{settings.letter_code}</dd>
            </div>
          </dl>
        </article>

        <article className="panel wa-panel">
          <div className="wa-icon" aria-hidden="true">
            <IconWhatsapp size={22} />
          </div>
          <p className="eyebrow">NOTIFIKASI</p>
          <h3>Pengiriman WhatsApp</h3>
          <p>
            Disposisi dapat diteruskan ke pegawai lewat tautan <code>wa.me</code> yang dibuka
            dari kartu disposisi. Pengiriman otomatis lewat gateway belum aktif.
          </p>

          <div className="wa-status">
            <span>
              <i aria-hidden="true" /> Status integrasi
            </span>
            <strong>{settings.wa_status}</strong>
          </div>

          <FormModal
            action={saveSettings}
            title="Alamat Gateway WhatsApp"
            eyebrow="PENGATURAN"
            trigger="Atur gateway"
            triggerClass="button secondary full-button"
            submitLabel="Simpan"
          >
            <div className="form-grid">
              <label className="field full">
                <span>URL gateway</span>
                <input
                  name="wa_gateway_url"
                  defaultValue={settings.wa_gateway_url}
                  placeholder="https://gateway.contoh.id/send"
                  autoComplete="off"
                />
              </label>
              <div className="full">
                <div className="notification-note">
                  <IconInfo size={14} />
                  <span>
                    Formulir ini menyimpan seluruh pengaturan instansi. Biarkan kolom lain
                    terisi nilai yang sudah ada agar tidak berubah.
                  </span>
                </div>
              </div>
            </div>
            {/* kolom lain dipertahankan agar tidak tertimpa kosong */}
            <input type="hidden" name="institution_name" value={settings.institution_name} />
            <input type="hidden" name="institution_area" value={settings.institution_area} />
            <input type="hidden" name="institution_address" value={settings.institution_address} />
            <input type="hidden" name="institution_phone" value={settings.institution_phone} />
            <input type="hidden" name="institution_email" value={settings.institution_email} />
            <input type="hidden" name="head_name" value={settings.head_name} />
            <input type="hidden" name="head_position" value={settings.head_position} />
            <input type="hidden" name="letter_code" value={settings.letter_code} />
          </FormModal>

          <span className="security-copy">
            Tanpa gateway, semua disposisi tetap tercatat dan bisa diteruskan secara manual.
            Riwayat pengiriman tersimpan pada status WhatsApp di tiap kartu disposisi.
          </span>
        </article>
      </section>

      <section className="panel settings-panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <div>
            <h3>Keamanan & Akses</h3>
            <p>Hal yang perlu diperhatikan sebelum aplikasi dipakai sehari-hari</p>
          </div>
        </div>

        <div className="classification-list" style={{ padding: "0 0 8px" }}>
          <div className="classification-row">
            <span className="class-code" style={{ minWidth: 74 }}>
              <IconShield size={14} />
            </span>
            <div>
              <h4>Portal verifikasi bersifat publik</h4>
              <p>
                Siapa pun yang memegang kode dapat memeriksa surat di{" "}
                <Link href="/verifikasi">/verifikasi</Link>. Kode dibuat 8 karakter tanpa huruf
                dan angka yang mudah tertukar, dan setiap surat punya kode unik.
              </p>
            </div>
          </div>

          <div className="classification-row">
            <span className="class-code" style={{ minWidth: 74 }}>
              <IconInfo size={14} />
            </span>
            <div>
              <h4>Belum ada autentikasi pengguna</h4>
              <p>
                Halaman admin saat ini terbuka untuk siapa pun yang bisa mengakses server.
                Sebelum dipakai di jaringan kantor, tambahkan login dan pembatasan peran.
              </p>
            </div>
          </div>

          <div className="classification-row">
            <span className="class-code" style={{ minWidth: 74 }}>
              <IconSettings size={14} />
            </span>
            <div>
              <h4>Cadangkan basis data secara berkala</h4>
              <p>
                Lampiran surat tersimpan di dalam basis data sebagai base64, sehingga berkas
                cadangan berisi seluruh dokumen sekaligus.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
