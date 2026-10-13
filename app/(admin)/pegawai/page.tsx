import Link from "next/link";
import { wajibMasuk } from "@/lib/auth";
import { boleh } from "@/lib/permissions";

import { createStaff, deleteStaff } from "@/actions/master";
import { listStaff } from "@/lib/queries";
import { initialsOf } from "@/lib/format";
import FormModal from "@/components/FormModal";
import {
  IconInfo,
  IconPhone,
  IconPlus,
  IconTrash,
  IconUsers,
  IconWhatsapp,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function PegawaiPage() {
  const pengguna = await wajibMasuk();
  const bolehTulis = boleh(pengguna.role, "masterTulis");

  const daftar = await listStaff();
  const aktif = daftar.filter((item) => item.status === "Aktif").length;
  const punyaWa = daftar.filter((item) => item.whatsapp).length;

  return (
    <>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h3>Data Pegawai</h3>
            <p>
              {daftar.length} pegawai · {aktif} aktif · {punyaWa} punya nomor WhatsApp
            </p>
          </div>
          {bolehTulis ? (
<FormModal
            action={createStaff}
            title="Tambah Pegawai"
            eyebrow="DATA MASTER"
            trigger="Tambah Pegawai"
            triggerIcon={<IconPlus size={14} />}
            submitLabel="Simpan pegawai"
          >
            <div className="form-grid">
              <label className="field">
                <span>
                  Nama lengkap <b>*</b>
                </span>
                <input
                  name="name"
                  required
                  placeholder="Budi Santoso, S.E."
                  maxLength={160}
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>NIP / NIK</span>
                <input
                  name="employeeNumber"
                  placeholder="19850312 201001 1 003"
                  maxLength={80}
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>
                  Jabatan <b>*</b>
                </span>
                <input
                  name="position"
                  required
                  placeholder="Kasi Penegakan Perda"
                  maxLength={160}
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>Nomor WhatsApp</span>
                <input
                  name="whatsapp"
                  placeholder="081234567890"
                  maxLength={32}
                  inputMode="tel"
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span>Status</span>
                <select name="status" defaultValue="Aktif">
                  <option value="Aktif">Aktif</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Nonaktif">Nonaktif</option>
                  <option value="Pensiun">Pensiun</option>
                </select>
              </label>

              <div className="field">
                <span>Catatan</span>
                <div className="notification-note" style={{ minHeight: 53 }}>
                  <IconWhatsapp size={14} />
                  <span>
                    Nomor apa pun formatnya (0812…, +62812…, 812…) akan disimpan seragam sebagai{" "}
                    <code>62812…</code>.
                  </span>
                </div>
              </div>
            </div>
          </FormModal>
      ) : null}
        </div>

        {daftar.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 220 }}>
            <div className="empty-icon" aria-hidden="true">
              <IconUsers size={20} />
            </div>
            <strong>Belum ada data pegawai</strong>
            <p>
              Pegawai di sini menjadi daftar penerima disposisi. Isi nomor WhatsApp bila ingin
              disposisi bisa langsung diteruskan lewat chat.
            </p>
          </div>
        ) : (
          <div className="staff-grid">
            {daftar.map((item) => {
              const nomorWa = item.whatsapp?.replace(/[^\d]/g, "") ?? "";
              return (
                <article className="staff-card" key={item.id}>
                  <div className="staff-avatar" aria-hidden="true">
                    {initialsOf(item.name)}
                  </div>
                  <div className="staff-info">
                    <h4>{item.name}</h4>
                    <p>{item.position}</p>
                    <span>{item.employeeNumber || "NIP belum diisi"}</span>
                  </div>
                  <span
                    className={`status-pill ${
                      item.status === "Aktif" ? "green" : item.status === "Cuti" ? "amber" : "slate"
                    }`}
                    style={{ height: "max-content" }}
                  >
                    <i aria-hidden="true" />
                    {item.status}
                  </span>

                  <div className="staff-phone">
                    {nomorWa ? (
                      <>
                        <IconWhatsapp size={13} />
                        <a href={`https://wa.me/${nomorWa}`} target="_blank" rel="noopener noreferrer">
                          +{nomorWa}
                        </a>
                      </>
                    ) : (
                      <>
                        <IconPhone size={13} />
                        <span>Nomor WhatsApp belum diisi</span>
                      </>
                    )}

                    {bolehTulis ? (


                      <form action={deleteStaff} style={{ marginLeft: "auto" }}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="row-icon"
                        title={`Hapus ${item.name}`}
                        aria-label={`Hapus ${item.name}`}
                        style={{ border: 0, cursor: "pointer", width: 24, height: 24 }}
                      >
                        <IconTrash size={12} />
                      </button>
                    </form>


                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <p className="system-note" style={{ marginTop: 16, justifyContent: "center" }}>
        <IconInfo size={13} />
        <span>
          Pegawai yang masih terhubung ke disposisi tidak dapat dihapus. Periksa{" "}
          <Link href="/disposisi">daftar disposisi</Link> lebih dulu.
        </span>
      </p>
    </>
  );
}
