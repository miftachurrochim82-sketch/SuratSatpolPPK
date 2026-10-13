import Link from "next/link";
import { wajibMasuk } from "@/lib/auth";
import { boleh } from "@/lib/permissions";

import {
  createDisposition,
  deleteDisposition,
  markWhatsappSent,
  setDispositionStatus,
} from "@/actions/dispositions";
import {
  listDispositions,
  listIncomingLetters,
  listStaff,
} from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import {
  formatDate,
  formatDateShort,
  daysUntil,
  initialsOf,
  toDateInputValue,
} from "@/lib/format";
import FormModal from "@/components/FormModal";
import GridFilter from "@/components/GridFilter";
import DispositionPrint from "@/components/DispositionPrint";
import {
  IconAlert,
  IconCheck,
  IconClock,
  IconDisposition,
  IconPlus,
  IconTrash,
  IconUsers,
  IconWhatsapp,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

const INSTRUKSI = [
  "Untuk ditindaklanjuti",
  "Untuk dilaksanakan",
  "Untuk diketahui",
  "Mohon pendapat dan arahan",
  "Harap dikoordinasikan",
  "Untuk diarsipkan",
];

const WARNA_TINDAK = {
  Pending: "amber",
  Proses: "sky",
  Selesai: "green",
} as const;

const WARNA_WA: Record<string, string> = {
  "Terkirim": "green",
  "Siap Dikirim": "sky",
  "Tidak Ada Nomor": "slate",
};

export default async function DisposisiPage() {
  const [disposisi, suratMasuk, pegawai, settings] = await Promise.all([
    listDispositions(),
    listIncomingLetters(),
    listStaff(),
    getSettings(),
  ]);

  const petaSurat = new Map(suratMasuk.map((item) => [item.id, item]));
  const petaPegawai = new Map(pegawai.map((item) => [item.id, item]));

  const pending = disposisi.filter((item) => item.followUpStatus === "Pending").length;
  const selesai = disposisi.filter((item) => item.followUpStatus === "Selesai").length;
  const belumDisposisi = suratMasuk.filter((item) => item.dispositionStatus !== "Sudah");

  const pengguna = await wajibMasuk();
  const bolehTulis = boleh(pengguna.role, "disposisiTulis");
  const bolehHapus = boleh(pengguna.role, "hapus");

  const hariIni = toDateInputValue();

  return (
    <>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h3>Lembar Disposisi</h3>
            <p>
              {disposisi.length} disposisi · {pending} pending · {selesai} selesai
            </p>
          </div>

          {bolehTulis ? (
<FormModal
            action={createDisposition}
            title="Buat Disposisi"
            eyebrow="DISPOSISI PIMPINAN"
            trigger="Buat Disposisi"
            triggerIcon={<IconPlus size={14} />}
            submitLabel="Kirim disposisi"
            wide
          >
            <div className="form-grid">
              <label className="field full">
                <span>
                  Surat masuk <b>*</b>
                </span>
                <select name="incomingLetterId" required defaultValue="">
                  <option value="" disabled>
                    Pilih surat yang akan didisposisikan
                  </option>
                  {suratMasuk.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.letterNumber} — {item.sender} ({item.subject.slice(0, 42)}
                      {item.subject.length > 42 ? "…" : ""})
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>
                  Diteruskan kepada <b>*</b>
                </span>
                <select name="staffId" required defaultValue="">
                  <option value="" disabled>
                    Pilih pegawai
                  </option>
                  {pegawai.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.position}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>
                  Instruksi <b>*</b>
                </span>
                <select name="instruction" required defaultValue="Untuk ditindaklanjuti">
                  {INSTRUKSI.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>
                  Tanggal disposisi <b>*</b>
                </span>
                <input type="date" name="dispositionDate" required defaultValue={hariIni} />
              </label>

              <label className="field">
                <span>Batas waktu penyelesaian</span>
                <input type="date" name="dueDate" />
              </label>

              <label className="field full">
                <span>Catatan pimpinan</span>
                <textarea
                  name="leaderNote"
                  rows={3}
                  placeholder="Koordinasikan dengan bidang terkait sebelum batas waktu."
                />
              </label>

              <div className="full">
                <div className="notification-note">
                  <IconWhatsapp size={14} />
                  <span>
                    Kalau pegawai punya nomor WhatsApp, disposisi ini diberi status{" "}
                    <strong>Siap Dikirim</strong> dan bisa langsung diteruskan lewat tautan
                    wa.me dari kartu disposisi.
                  </span>
                </div>
              </div>
            </div>

            {suratMasuk.length === 0 ? (
              <p className="security-copy" style={{ marginTop: 12 }}>
                Belum ada surat masuk. Catat dulu di{" "}
                <Link href="/surat-masuk">halaman Surat Masuk</Link>.
              </p>
            ) : null}
            {pegawai.length === 0 ? (
              <p className="security-copy" style={{ marginTop: 6 }}>
                Belum ada data pegawai. Tambahkan dulu di{" "}
                <Link href="/pegawai">halaman Pegawai</Link>.
              </p>
            ) : null}
          </FormModal>
      ) : null}
        </div>

        {belumDisposisi.length > 0 ? (
          <div style={{ padding: "0 22px 16px" }}>
            <p className="notification-note">
              <IconAlert size={14} />
              <span>
                <strong>{belumDisposisi.length} surat masuk belum didisposisikan.</strong> Surat
                dengan nomor agenda {belumDisposisi.slice(0, 3).map((item) => item.agendaNo).join(", ")}
                {belumDisposisi.length > 3 ? ", dan lainnya" : ""} masih menunggu arahan pimpinan.
              </span>
            </p>
          </div>
        ) : null}

        {disposisi.length > 0 ? (
          <GridFilter
            placeholder="Cari perihal, nomor surat, instruksi, atau penerima…"
            targetId="grid-disposisi"
            kartuSelector=".disposition-card"
            satuan="disposisi"
            options={[
              { value: "Pending", label: "Pending" },
              { value: "Selesai", label: "Selesai" },
            ]}
            kosong={{
              judul: "Tidak ada disposisi yang cocok",
              pesan: "Ubah kata pencarian atau pilih status lain.",
            }}
          />
        ) : null}

        {disposisi.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 220 }}>
            <div className="empty-icon" aria-hidden="true">
              <IconDisposition size={20} />
            </div>
            <strong>Belum ada disposisi</strong>
            <p>
              Disposisi menghubungkan surat masuk dengan pegawai yang bertanggung jawab,
              lengkap dengan instruksi dan batas waktu penyelesaian.
            </p>
          </div>
        ) : (
          <div className="disposition-grid" id="grid-disposisi">
            {disposisi.map((item) => {
              const surat = petaSurat.get(item.incomingLetterId);
              const orang = petaPegawai.get(item.staffId);
              const sisaHari = daysUntil(item.dueDate);
              const lewatTenggat = sisaHari !== null && sisaHari < 0 && item.followUpStatus !== "Selesai";
              const nomorWa = item.whatsapp?.replace(/[^\d]/g, "") ?? "";
              const pesanWa = encodeURIComponent(
                `Disposisi surat ${item.letterNumber}\n` +
                  `Perihal: ${item.subject}\n` +
                  `Instruksi: ${item.instruction}\n` +
                  (item.dueDate ? `Batas waktu: ${formatDate(item.dueDate)}\n` : "") +
                  (item.leaderNote ? `Catatan: ${item.leaderNote}` : ""),
              );

              return (
                <article
                  className="disposition-card"
                  key={item.id}
                  data-status={item.followUpStatus}
                >
                  <div className="disp-top">
                    <div className="disp-symbol" aria-hidden="true">
                      <IconDisposition size={15} />
                    </div>
                    <div>
                      <p>{item.letterNumber}</p>
                      <h4>{item.subject}</h4>
                    </div>
                    <span
                      className={`status-pill ${
                        WARNA_TINDAK[item.followUpStatus as keyof typeof WARNA_TINDAK] ?? "slate"
                      }`}
                    >
                      <i aria-hidden="true" />
                      {item.followUpStatus}
                    </span>
                  </div>

                  <div className="disp-line">
                    <div>
                      <span>Asal surat</span>
                      <strong>{surat?.sender ?? "—"}</strong>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span>Sifat</span>
                      <strong>{surat?.securityLevel ?? "Biasa"}</strong>
                    </div>
                  </div>

                  <div className="disp-meta">
                    <div>
                      <span>Penerima</span>
                      <strong>
                        {item.staffName}
                        <br />
                        <span style={{ fontWeight: 400, color: "#8a99ab" }}>
                          {orang?.position ?? "—"}
                        </span>
                      </strong>
                    </div>
                    <div>
                      <span>Tanggal</span>
                      <strong>{formatDateShort(item.dispositionDate)}</strong>
                    </div>
                    <div>
                      <span>Batas waktu</span>
                      <strong style={lewatTenggat ? { color: "#c74b57" } : undefined}>
                        {item.dueDate ? formatDateShort(item.dueDate) : "—"}
                      </strong>
                      {sisaHari !== null ? (
                        <span
                          style={{
                            color: lewatTenggat ? "#c74b57" : "#7b899a",
                            display: "block",
                            marginTop: 3,
                          }}
                        >
                          {lewatTenggat
                            ? `Lewat ${Math.abs(sisaHari)} hari`
                            : sisaHari === 0
                              ? "Hari ini"
                              : `${sisaHari} hari lagi`}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {item.leaderNote ? <p className="leader-note">{item.leaderNote}</p> : null}

                  <div className="disp-line" style={{ marginTop: 12, borderTop: 0, borderBottom: 0, padding: "4px 0" }}>
                    <div>
                      <span>Instruksi</span>
                      <strong>{item.instruction}</strong>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span>WhatsApp</span>
                      <span
                        className={`status-pill ${WARNA_WA[item.whatsappStatus] ?? "slate"}`}
                        style={{ marginTop: 3 }}
                      >
                        <i aria-hidden="true" />
                        {item.whatsappStatus}
                      </span>
                    </div>
                  </div>

                  <div className="disp-actions">
                    <div className="legend-inline">
                      {nomorWa ? (
                        <a
                          className="mini-button"
                          href={`https://wa.me/${nomorWa}?text=${pesanWa}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Kirim ke ${item.staffName}`}
                        >
                          <IconWhatsapp size={11} /> Kirim WA
                        </a>
                      ) : (
                        <span className="mini-button" style={{ opacity: 0.55, cursor: "not-allowed" }}>
                          <IconWhatsapp size={11} /> Tanpa nomor
                        </span>
                      )}

                      {bolehTulis && item.whatsappStatus === "Siap Dikirim" ? (
                        <form action={markWhatsappSent}>
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" className="mini-button" title="Tandai sudah dikirim">
                            <IconCheck size={11} /> Tandai terkirim
                          </button>
                        </form>
                      ) : null}
                    </div>

                    <div className="row-actions">
                      <DispositionPrint
                        data={{
                          id: item.id,
                          letterNumber: item.letterNumber,
                          subject: item.subject,
                          sender: surat?.sender ?? "—",
                          securityLevel: surat?.securityLevel ?? "Biasa",
                          letterDate: String(surat?.letterDate ?? ""),
                          receivedDate: String(surat?.receivedDate ?? ""),
                          instruction: item.instruction,
                          leaderNote: item.leaderNote,
                          staffName: item.staffName,
                          staffPosition: orang?.position ?? "—",
                          dispositionDate: String(item.dispositionDate),
                          dueDate: item.dueDate ? String(item.dueDate) : null,
                        }}
                        qrText={[
                          "LEMBAR DISPOSISI",
                          `Agenda: ${item.letterNumber}`,
                          `Perihal: ${item.subject}`,
                          `Kepada: ${item.staffName}`,
                          `Instruksi: ${item.instruction}`,
                          `Batas waktu: ${item.dueDate ? formatDateShort(item.dueDate) : "-"}`,
                        ].join(" | ")}
                        institutionName={settings.institution_name}
                        institutionArea={settings.institution_area}
                        institutionAddress={settings.institution_address}
                        headName={settings.head_name}
                        headPosition={settings.head_position}
                      />

                      {bolehTulis ? (
                        item.followUpStatus === "Selesai" ? (
                          <form action={setDispositionStatus}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="status" value="Pending" />
                            <button type="submit" className="mini-button" title="Buka kembali disposisi">
                              <IconClock size={11} /> Buka lagi
                            </button>
                          </form>
                        ) : (
                          <form action={setDispositionStatus}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="status" value="Selesai" />
                            <button type="submit" className="mini-button" title="Tandai selesai">
                              <IconCheck size={11} /> Selesai
                            </button>
                          </form>
                        )
                      ) : null}

                      {bolehHapus ? (


                        <form action={deleteDisposition}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="row-icon"
                          title="Hapus disposisi"
                          aria-label={`Hapus disposisi ${item.letterNumber}`}
                          style={{ border: 0, cursor: "pointer" }}
                        >
                          <IconTrash size={12} />
                        </button>
                      </form>


                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <p className="system-note" style={{ marginTop: 16, justifyContent: "center" }}>
        <IconUsers size={13} />
        <span>
          Kelola daftar penerima disposisi di <Link href="/pegawai">halaman Pegawai</Link>.
          Nomor WhatsApp otomatis dinormalkan ke format <code>62…</code> agar siap dipakai.
        </span>
      </p>
    </>
  );
}
