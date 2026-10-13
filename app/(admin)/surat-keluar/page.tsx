import Link from "next/link";
import { wajibMasuk } from "@/lib/auth";
import { boleh } from "@/lib/permissions";

import {
  createOutgoingLetter,
  deleteOutgoingLetter,
  updateArchiveStatus,
} from "@/actions/letters";
import { listClassifications, listOutgoingLetters } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { formatDate, formatDateShort, romanMonth, toDateInputValue, yearOf } from "@/lib/format";
import FormModal from "@/components/FormModal";
import DetailModal from "@/components/DetailModal";
import TableFilter from "@/components/TableFilter";
import FileField from "@/components/FileField";
import QrModal from "@/components/QrModal";
import {
  IconCheck,
  IconFile,
  IconMailOut,
  IconPlus,
  IconQr,
  IconShield,
  IconTrash,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

const STATUS_ARSIP = ["Draft", "Ditandatangani", "Terkirim", "Diarsipkan"];

const WARNA_ARSIP: Record<string, string> = {
  Draft: "slate",
  Ditandatangani: "amber",
  Terkirim: "sky",
  Diarsipkan: "green",
};

export default async function SuratKeluarPage() {
  const [surat, klasifikasi, settings] = await Promise.all([
    listOutgoingLetters(),
    listClassifications(),
    getSettings(),
  ]);

  const pengguna = await wajibMasuk();
  const bolehTulis = boleh(pengguna.role, "suratKeluarTulis");
  const bolehHapus = boleh(pengguna.role, "hapus");

  const hariIni = toDateInputValue();
  const petaKlasifikasi = new Map(klasifikasi.map((item) => [item.code, item.name]));

  // contoh nomor yang akan terbentuk untuk agenda berikutnya
  const pratinjauNomor = `${String((surat[0]?.agendaNo ?? 0) + 1).padStart(3, "0")}/${
    settings.letter_code
  }/${romanMonth(new Date())}/${yearOf()}`;

  return (
    <>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h3>Daftar Surat Keluar</h3>
            <p>
              {surat.length} berkas tercatat
              {surat.length > 0 ? " · setiap surat punya kode verifikasi QR" : ""}
            </p>
          </div>
          {bolehTulis ? (
<FormModal
            action={createOutgoingLetter}
            title="Catat Surat Keluar"
            eyebrow="FORMULIR ADMINISTRASI"
            trigger="Catat Surat Keluar"
            triggerIcon={<IconPlus size={14} />}
            submitLabel="Simpan & buat QR"
          >
            <div className="form-grid">
              <label className="field">
                <span>
                  Tujuan surat <b>*</b>
                </span>
                <input
                  name="recipient"
                  required
                  placeholder="Camat Trenggalek"
                  maxLength={200}
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>
                  Tanggal surat <b>*</b>
                </span>
                <input type="date" name="letterDate" required defaultValue={hariIni} />
              </label>

              <label className="field">
                <span>
                  Klasifikasi <b>*</b>
                </span>
                <select name="classificationCode" required defaultValue="">
                  <option value="" disabled>
                    Pilih klasifikasi
                  </option>
                  {klasifikasi.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} — {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>
                  Penandatangan <b>*</b>
                </span>
                <input
                  name="signer"
                  required
                  defaultValue={settings.head_name}
                  maxLength={160}
                  autoComplete="off"
                />
              </label>

              <label className="field full">
                <span>
                  Perihal <b>*</b>
                </span>
                <textarea
                  name="subject"
                  required
                  rows={3}
                  placeholder="Permohonan bantuan personel pengamanan"
                />
              </label>

              <label className="field">
                <span>Status arsip</span>
                <select name="archiveStatus" defaultValue="Draft">
                  {STATUS_ARSIP.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <div className="field">
                <span>Nomor surat otomatis</span>
                <div className="number-preview" style={{ padding: "8px 10px" }}>
                  <strong style={{ margin: 0, fontSize: 11 }}>{pratinjauNomor}</strong>
                  <small>Terbentuk dari agenda + bulan Romawi + tahun berjalan</small>
                </div>
              </div>

              <FileField label="Draf surat (opsional)" />

              <div className="full">
                <div className="notification-note">
                  <IconQr size={14} />
                  <span>
                    Setelah disimpan, sistem membuat <strong>kode verifikasi unik</strong> dan QR
                    code yang bisa dicetak di surat. Penerima dapat memindai QR tersebut untuk
                    memeriksa keaslian dokumen.
                  </span>
                </div>
              </div>
            </div>

            {klasifikasi.length === 0 ? (
              <p className="security-copy" style={{ marginTop: 12 }}>
                Belum ada klasifikasi surat. Tambahkan dulu di{" "}
                <Link href="/klasifikasi">halaman Klasifikasi</Link>.
              </p>
            ) : null}
          </FormModal>
      ) : null}
        </div>

        <TableFilter
          placeholder="Cari nomor surat, tujuan, atau perihal…"
          targetId="tabel-surat-keluar"
          filterLabel="Semua klasifikasi"
          options={klasifikasi.map((item) => ({
            value: item.code,
            label: `${item.code} — ${item.name}`,
          }))}
        />

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Agenda</th>
                <th>Nomor Surat</th>
                <th>Tujuan</th>
                <th>Perihal</th>
                <th>Penandatangan</th>
                <th>Tanggal</th>
                <th>Arsip</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody id="tabel-surat-keluar">
              {surat.length === 0 ? (
                <tr data-empty="true">
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-icon" aria-hidden="true">
                        <IconMailOut size={20} />
                      </div>
                      <strong>Belum ada surat keluar</strong>
                      <p>
                        Setiap surat keluar otomatis mendapat nomor resmi dan kode verifikasi
                        QR yang bisa dicetak untuk memeriksa keasliannya.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                surat.map((item) => (
                  <tr key={item.id} data-kode={item.classificationCode}>
                    <td data-label="Agenda">
                      <span className="agenda-no">{String(item.agendaNo).padStart(3, "0")}</span>
                    </td>
                    <td data-label="Nomor surat" className="number-cell">
                      {item.officialNumber}
                      <small>Kode {item.verificationCode}</small>
                    </td>
                    <td data-label="Tujuan">{item.recipient}</td>
                    <td data-label="Perihal" className="subject-cell" title={item.subject}>
                      {item.subject}
                    </td>
                    <td data-label="Penandatangan">
                      {item.signer}
                      <small>
                        {item.classificationCode} —{" "}
                        {petaKlasifikasi.get(item.classificationCode) ?? "—"}
                      </small>
                    </td>
                    <td data-label="Tanggal">{formatDateShort(item.letterDate)}</td>
                    <td data-label="Arsip">
                      <span className={`status-pill ${WARNA_ARSIP[item.archiveStatus] ?? "slate"}`}>
                        <i aria-hidden="true" />
                        {item.archiveStatus}
                      </span>
                    </td>
                    <td data-label="Aksi">
                      <div className="row-actions">
                        <QrModal
                          code={item.verificationCode}
                          nomor={item.officialNumber}
                          perihal={item.subject}
                          tanda={item.signer}
                        />

                        <DetailModal title={item.subject} eyebrow="RINCIAN SURAT KELUAR">
                          <div>
                            <dt>Nomor agenda</dt>
                            <dd>{item.agendaNo}</dd>
                          </div>
                          <div>
                            <dt>Nomor resmi</dt>
                            <dd>{item.officialNumber}</dd>
                          </div>
                          <div>
                            <dt>Tujuan</dt>
                            <dd>{item.recipient}</dd>
                          </div>
                          <div>
                            <dt>Perihal</dt>
                            <dd>{item.subject}</dd>
                          </div>
                          <div>
                            <dt>Tanggal surat</dt>
                            <dd>{formatDate(item.letterDate)}</dd>
                          </div>
                          <div>
                            <dt>Penandatangan</dt>
                            <dd>{item.signer}</dd>
                          </div>
                          <div>
                            <dt>Klasifikasi</dt>
                            <dd>
                              {item.classificationCode} —{" "}
                              {petaKlasifikasi.get(item.classificationCode) ?? "—"}
                            </dd>
                          </div>
                          <div>
                            <dt>Kode verifikasi</dt>
                            <dd style={{ letterSpacing: 1 }}>{item.verificationCode}</dd>
                          </div>
                          <div>
                            <dt>Status arsip</dt>
                            <dd>{item.archiveStatus}</dd>
                          </div>
                          <div>
                            <dt>Dicatat oleh</dt>
                            <dd>{item.createdBy}</dd>
                          </div>
                          {item.attachmentId ? (
                            <div>
                              <dt>Lampiran</dt>
                              <dd>
                                <a
                                  href={`/api/lampiran/${item.attachmentId}`}
                                  className="mini-button"
                                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                                >
                                  <IconFile size={11} /> Unduh berkas
                                </a>
                              </dd>
                            </div>
                          ) : null}
                        </DetailModal>

                        {bolehTulis && item.archiveStatus !== "Diarsipkan" ? (
                          <form action={updateArchiveStatus}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="status" value="Diarsipkan" />
                            <button
                              type="submit"
                              className="row-icon"
                              title="Tandai sudah diarsipkan"
                              aria-label={`Arsipkan surat ${item.officialNumber}`}
                              style={{ border: 0, cursor: "pointer" }}
                            >
                              <IconCheck size={13} />
                            </button>
                          </form>
                        ) : null}

                        {bolehHapus ? (


                          <form action={deleteOutgoingLetter}>
                          <input type="hidden" name="id" value={item.id} />
                          <button
                            type="submit"
                            className="row-icon"
                            title="Hapus surat"
                            aria-label={`Hapus surat ${item.officialNumber}`}
                            style={{ border: 0, cursor: "pointer" }}
                          >
                            <IconTrash size={13} />
                          </button>
                        </form>


                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="system-note" style={{ marginTop: 16, justifyContent: "center" }}>
        <IconShield size={13} />
        <span>
          Penerima surat dapat memverifikasi keaslian dokumen di{" "}
          <Link href="/verifikasi">portal verifikasi publik</Link> dengan memindai QR atau
          mengetik kode verifikasi.
        </span>
      </p>
    </>
  );
}
