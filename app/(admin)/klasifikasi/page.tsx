import Link from "next/link";
import { wajibMasuk } from "@/lib/auth";
import { boleh } from "@/lib/permissions";

import {
  createClassification,
  deleteClassification,
  quickAddClassification,
} from "@/actions/master";
import { listClassifications } from "@/lib/queries";
import FormModal from "@/components/FormModal";
import { IconInfo, IconPlus, IconTag, IconTrash } from "@/components/Icons";

export const dynamic = "force-dynamic";

const USULAN = [
  { code: "HM.01", name: "Undangan", description: "Surat undangan rapat, kegiatan, atau upacara." },
  { code: "HM.02", name: "Permohonan", description: "Permintaan bantuan, data, atau personel." },
  { code: "HM.03", name: "Pemberitahuan", description: "Informasi kegiatan atau kebijakan baru." },
  { code: "HM.04", name: "Laporan", description: "Laporan hasil kegiatan atau kejadian." },
  { code: "HM.05", name: "Nota Dinas", description: "Komunikasi internal antar bidang." },
  { code: "HM.06", name: "Surat Tugas", description: "Penugasan pegawai untuk kegiatan tertentu." },
];

export default async function KlasifikasiPage() {
  const pengguna = await wajibMasuk();
  const bolehTulis = boleh(pengguna.role, "masterTulis");

  const daftar = await listClassifications();
  const sudahAda = new Set(daftar.map((item) => item.code));
  const sisaUsulan = USULAN.filter((item) => !sudahAda.has(item.code));

  return (
    <>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h3>Kode Klasifikasi Surat</h3>
            <p>
              {daftar.length} klasifikasi terdaftar · dipakai untuk mengelompokkan surat masuk
              dan keluar
            </p>
          </div>
          {bolehTulis ? (
<FormModal
            action={createClassification}
            title="Tambah Klasifikasi"
            eyebrow="DATA MASTER"
            trigger="Tambah Klasifikasi"
            triggerIcon={<IconPlus size={14} />}
            submitLabel="Simpan klasifikasi"
          >
            <div className="form-grid">
              <label className="field">
                <span>
                  Kode <b>*</b>
                </span>
                <input
                  name="code"
                  required
                  placeholder="HM.01"
                  maxLength={32}
                  autoComplete="off"
                  style={{ textTransform: "uppercase" }}
                />
              </label>

              <label className="field">
                <span>
                  Nama klasifikasi <b>*</b>
                </span>
                <input
                  name="name"
                  required
                  placeholder="Undangan"
                  maxLength={160}
                  autoComplete="off"
                />
              </label>

              <label className="field full">
                <span>Keterangan</span>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Surat undangan rapat, kegiatan, atau upacara."
                />
              </label>
            </div>
          </FormModal>
      ) : null}
        </div>

        {daftar.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 220 }}>
            <div className="empty-icon" aria-hidden="true">
              <IconTag size={20} />
            </div>
            <strong>Belum ada klasifikasi surat</strong>
            <p>
              Klasifikasi dipakai saat mencatat surat masuk dan keluar, serta menjadi pilihan
              filter pada daftar surat.
            </p>
          </div>
        ) : (
          <div className="classification-list">
            {daftar.map((item) => (
              <div className="classification-row" key={item.code}>
                <span className="class-code">{item.code}</span>
                <div>
                  <h4>{item.name}</h4>
                  <p>{item.description || "Tanpa keterangan"}</p>
                </div>
                {bolehTulis ? (

                  <form action={deleteClassification} style={{ marginLeft: "auto" }}>
                  <input type="hidden" name="code" value={item.code} />
                  <button
                    type="submit"
                    className="row-icon"
                    title={`Hapus klasifikasi ${item.code}`}
                    aria-label={`Hapus klasifikasi ${item.code}`}
                    style={{ border: 0, cursor: "pointer" }}
                  >
                    <IconTrash size={13} />
                  </button>
                </form>

                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {sisaUsulan.length > 0 ? (
        <section className="panel table-panel" style={{ marginTop: 18 }}>
          <div className="table-toolbar">
            <div>
              <h3>Klasifikasi yang Sering Dipakai</h3>
              <p>Tambahkan dengan satu klik — kode dan keterangannya sudah terisi</p>
            </div>
          </div>
          <div className="classification-list">
            {sisaUsulan.map((item) => (
              <div className="classification-row" key={item.code}>
                <span className="class-code">{item.code}</span>
                <div>
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                </div>
                {bolehTulis ? (

                  <form action={quickAddClassification} style={{ marginLeft: "auto" }}>
                  <input type="hidden" name="code" value={item.code} />
                  <input type="hidden" name="name" value={item.name} />
                  <input type="hidden" name="description" value={item.description} />
                  <button type="submit" className="mini-button">
                    <IconPlus size={11} /> Tambahkan
                  </button>
                </form>

                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <p className="system-note" style={{ marginTop: 16, justifyContent: "center" }}>
        <IconInfo size={13} />
        <span>
          Klasifikasi yang masih dipakai surat tidak dapat dihapus — lihat{" "}
          <Link href="/surat-masuk">daftar surat</Link> untuk memeriksa pemakaiannya.
        </span>
      </p>
    </>
  );
}
