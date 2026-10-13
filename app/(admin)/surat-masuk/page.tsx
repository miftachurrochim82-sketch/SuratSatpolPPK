import { createIncomingLetter, deleteIncomingLetter } from "@/actions/letters";
import { listClassifications, listIncomingLetters } from "@/lib/queries";
import { formatDate, formatDateShort, toDateInputValue } from "@/lib/format";
import FormModal from "@/components/FormModal";
import DetailModal from "@/components/DetailModal";
import TableFilter from "@/components/TableFilter";
import FileField from "@/components/FileField";
import {
  IconDisposition,
  IconFile,
  IconMailIn,
  IconPlus,
  IconTrash,
} from "@/components/Icons";
import Link from "next/link";
import { wajibMasuk } from "@/lib/auth";
import { boleh } from "@/lib/permissions";


export const dynamic = "force-dynamic";

const TINGKAT_KEAMANAN = ["Biasa", "Terbatas", "Rahasia", "Sangat Rahasia"];

const WARNA_STATUS: Record<string, string> = {
  Sudah: "green",
  Belum: "amber",
};

export default async function SuratMasukPage() {
  const [surat, klasifikasi] = await Promise.all([
    listIncomingLetters(),
    listClassifications(),
  ]);

  const pengguna = await wajibMasuk();
  const bolehTulis = boleh(pengguna.role, "suratMasukTulis");
  const bolehHapus = boleh(pengguna.role, "hapus");

  const hariIni = toDateInputValue();
  const petaKlasifikasi = new Map(klasifikasi.map((item) => [item.code, item.name]));

  return (
    <>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h3>Daftar Surat Masuk</h3>
            <p>
              {surat.length} berkas tercatat
              {surat.length > 0 ? ` · agenda terakhir No. ${surat[0].agendaNo}` : ""}
            </p>
          </div>
          {bolehTulis ? (
<FormModal
            action={createIncomingLetter}
            title="Catat Surat Masuk"
            eyebrow="FORMULIR ADMINISTRASI"
            trigger="Catat Surat Masuk"
            triggerIcon={<IconPlus size={14} />}
            submitLabel="Simpan surat"
          >
            <div className="form-grid">
              <label className="field">
                <span>
                  Nomor surat <b>*</b>
                </span>
                <input
                  name="letterNumber"
                  required
                  placeholder="005/123/35.07.302/2026"
                  maxLength={120}
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
                  Pengirim / asal surat <b>*</b>
                </span>
                <input
                  name="sender"
                  required
                  placeholder="Bagian Organisasi Setda"
                  maxLength={200}
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>
                  Tanggal diterima <b>*</b>
                </span>
                <input type="date" name="receivedDate" required defaultValue={hariIni} />
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
                <span>Tingkat keamanan</span>
                <select name="securityLevel" defaultValue="Biasa">
                  {TINGKAT_KEAMANAN.map((tingkat) => (
                    <option key={tingkat} value={tingkat}>
                      {tingkat}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field full">
                <span>
                  Perihal <b>*</b>
                </span>
                <textarea
                  name="subject"
                  required
                  rows={3}
                  placeholder="Undangan rapat koordinasi penertiban PKL"
                />
              </label>

              <FileField label="Scan surat (opsional)" />

              <div className="full">
                <div className="notification-note">
                  <IconFile size={14} />
                  <span>
                    Nomor agenda diberikan otomatis oleh sistem. Berkas besar sebaiknya
                    dikompres menjadi PDF di bawah 2 MB.
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
          placeholder="Cari nomor surat, pengirim, perihal, atau kode…"
          targetId="tabel-surat-masuk"
          satuan="berkas"
          sortable
          filters={[
            {
              param: "status",
              attribute: "data-kode",
              label: "Semua klasifikasi",
              options: klasifikasi.map((item) => ({
                value: item.code,
                label: `${item.code} — ${item.name}`,
              })),
            },
            {
              param: "disposisi",
              attribute: "data-disposisi",
              label: "Semua status disposisi",
              options: [
                { value: "Belum", label: "Belum didisposisi" },
                { value: "Sudah", label: "Sudah didisposisi" },
              ],
            },
          ]}
        />

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th data-urut="agenda" aria-sort="none">Agenda</th>
                <th>Nomor Surat</th>
                <th>Pengirim</th>
                <th>Perihal</th>
                <th>Klasifikasi</th>
                <th data-urut="tanggal" aria-sort="none">Diterima</th>
                <th>Disposisi</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody id="tabel-surat-masuk">
              {surat.length === 0 ? (
                <tr data-empty="true">
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-icon" aria-hidden="true">
                        <IconMailIn size={20} />
                      </div>
                      <strong>Belum ada surat masuk</strong>
                      <p>
                        Setiap surat yang dicatat akan mendapat nomor agenda otomatis dan
                        langsung bisa didisposisikan ke pegawai.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                surat.map((item) => (
                  <tr
                    key={item.id}
                    data-kode={item.classificationCode}
                    data-disposisi={item.dispositionStatus}
                    data-urut-agenda={item.agendaNo}
                  >
                    <td data-label="Agenda">
                      <span className="agenda-no">{String(item.agendaNo).padStart(3, "0")}</span>
                    </td>
                    <td data-label="Nomor surat" className="number-cell">
                      {item.letterNumber}
                      <small>{item.securityLevel}</small>
                    </td>
                    <td data-label="Pengirim">{item.sender}</td>
                    <td data-label="Perihal" className="subject-cell" title={item.subject}>
                      {item.subject}
                    </td>
                    <td data-label="Klasifikasi">
                      <span className="class-code" style={{ minWidth: 42, padding: "5px 7px" }}>
                        {item.classificationCode}
                      </span>
                      <small>{petaKlasifikasi.get(item.classificationCode) ?? "—"}</small>
                    </td>
                    <td data-label="Diterima">
                      {formatDateShort(item.receivedDate)}
                      <small>Surat {formatDateShort(item.letterDate)}</small>
                    </td>
                    <td data-label="Disposisi">
                      <span className={`status-pill ${WARNA_STATUS[item.dispositionStatus] ?? "slate"}`}>
                        <i aria-hidden="true" />
                        {item.dispositionStatus}
                      </span>
                    </td>
                    <td data-label="Aksi">
                      <div className="row-actions">
                        <DetailModal title={item.subject} eyebrow="RINCIAN SURAT MASUK">
                          <div>
                            <dt>Nomor agenda</dt>
                            <dd>{item.agendaNo}</dd>
                          </div>
                          <div>
                            <dt>Nomor surat</dt>
                            <dd>{item.letterNumber}</dd>
                          </div>
                          <div>
                            <dt>Pengirim</dt>
                            <dd>{item.sender}</dd>
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
                            <dt>Diterima</dt>
                            <dd>{formatDate(item.receivedDate)}</dd>
                          </div>
                          <div>
                            <dt>Klasifikasi</dt>
                            <dd>
                              {item.classificationCode} —{" "}
                              {petaKlasifikasi.get(item.classificationCode) ?? "—"}
                            </dd>
                          </div>
                          <div>
                            <dt>Tingkat keamanan</dt>
                            <dd>{item.securityLevel}</dd>
                          </div>
                          <div>
                            <dt>Status disposisi</dt>
                            <dd>{item.dispositionStatus}</dd>
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

                        {bolehHapus ? (


                          <form action={deleteIncomingLetter}>
                          <input type="hidden" name="id" value={item.id} />
                          <button
                            type="submit"
                            className="row-icon"
                            title="Hapus surat"
                            aria-label={`Hapus surat ${item.letterNumber}`}
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
        <IconDisposition size={13} />
        <span>
          Surat yang sudah tercatat bisa langsung didisposisikan di{" "}
          <Link href="/disposisi">halaman Disposisi</Link>.
        </span>
      </p>
    </>
  );
}
