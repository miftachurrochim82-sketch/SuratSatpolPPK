import Link from "next/link";
import {
  createUser,
  deleteUser,
  resetSandiUser,
  ubahPeranUser,
  ubahStatusUser,
} from "@/actions/users";
import { listStaff, listUsers } from "@/lib/queries";
import { wajibIzin } from "@/lib/auth";
import { PERAN, DEFINISI, definisiPeran } from "@/lib/permissions";
import { formatDateTime, initialsOf } from "@/lib/format";
import FormModal from "@/components/FormModal";
import {
  IconInfo,
  IconKey,
  IconTrash,
  IconUserPlus,
  IconUsers,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

const WARNA_STATUS: Record<string, string> = {
  Aktif: "green",
  Cuti: "amber",
  Nonaktif: "slate",
};

const WARNA_PERAN: Record<string, string> = {
  admin: "red",
  tu: "sky",
  pimpinan: "amber",
  pegawai: "slate",
};

export default async function PenggunaPage() {
  // hanya administrator; peran lain dialihkan
  const pengguna = await wajibIzin("pengguna");

  const [daftar, pegawai] = await Promise.all([listUsers(), listStaff()]);
  const petaPegawai = new Map(pegawai.map((item) => [item.id, item]));

  const jumlahAdmin = daftar.filter((item) => item.role === "admin").length;

  return (
    <>
      <section className="table-toolbar" style={{ padding: 0, marginBottom: 18 }}>
        <div>
          <h3>Akun Petugas</h3>
          <p>
            {daftar.length} akun terdaftar · {jumlahAdmin} administrator · peran menentukan hak
            akses
          </p>
        </div>
        <FormModal
          action={createUser}
          title="Tambah Pengguna"
          eyebrow="PENGELOLAAN AKSES"
          trigger="Tambah Pengguna"
          triggerIcon={<IconUserPlus size={14} />}
          submitLabel="Buat akun"
          wide
        >
          <div className="form-grid">
            <label className="field">
              <span>
                Nama pengguna <b>*</b>
              </span>
              <input
                name="username"
                required
                placeholder="budi.tu"
                maxLength={60}
                autoComplete="off"
                style={{ textTransform: "lowercase" }}
              />
            </label>

            <label className="field">
              <span>
                Nama petugas <b>*</b>
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
              <span>
                Peran <b>*</b>
              </span>
              <select name="role" required defaultValue="tu">
                {PERAN.map((peran) => (
                  <option key={peran} value={peran}>
                    {DEFINISI[peran].label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>
                Kata sandi awal <b>*</b>
              </span>
              <input
                name="password"
                type="password"
                required
                placeholder="Minimal 8 karakter, ada huruf & angka"
                autoComplete="new-password"
              />
            </label>

            <label className="field full">
              <span>Terhubung ke data pegawai (untuk peran Pegawai)</span>
              <select name="staffId" defaultValue="">
                <option value="">— Tidak ditautkan —</option>
                {pegawai.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.position}
                  </option>
                ))}
              </select>
            </label>

            <div className="full">
              <div className="notification-note">
                <IconInfo size={14} />
                <span>
                  Tautan ke data pegawai hanya diperlukan untuk peran <strong>Pegawai</strong>,
                  supaya ia melihat disposisi yang ditujukan kepadanya saja.
                </span>
              </div>
            </div>

            <div className="full">
              <dl className="verify-data" style={{ margin: 0 }}>
                {PERAN.map((peran) => (
                  <div key={peran} style={{ gridTemplateColumns: "108px 1fr" }}>
                    <dt>{DEFINISI[peran].label}</dt>
                    <dd style={{ fontWeight: 400, fontSize: 10, lineHeight: 15 }}>
                      {DEFINISI[peran].keterangan}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </FormModal>
      </section>

      {daftar.length === 0 ? (
        <div className="panel empty-state" style={{ minHeight: 240 }}>
          <div className="empty-icon" aria-hidden="true">
            <IconUsers size={20} />
          </div>
          <strong>Belum ada akun pengguna</strong>
          <p>
            Buat akun pertama untuk petugas Tata Usaha. Selama belum ada akun, tidak ada yang
            bisa masuk ke halaman admin.
          </p>
        </div>
      ) : (
        <div className="staff-grid" style={{ padding: 0 }}>
          {daftar.map((item) => {
            const orang = item.staffId ? petaPegawai.get(item.staffId) : null;
            const diriSendiri = item.id === pengguna.id;
            const adminTerakhir = item.role === "admin" && jumlahAdmin <= 1;

            return (
              <article className="staff-card" key={item.id}>
                <div className="staff-avatar" aria-hidden="true">
                  {initialsOf(item.name)}
                </div>

                <div className="staff-info">
                  <h4>
                    {item.name}
                    {diriSendiri ? (
                      <span
                        style={{
                          marginLeft: 6,
                          color: "#8a99ab",
                          fontSize: 9,
                          fontWeight: 600,
                        }}
                      >
                        (Anda)
                      </span>
                    ) : null}
                  </h4>
                  <p>@{item.username}</p>
                  <span>
                    {orang ? orang.position : definisiPeran(item.role).keterangan.slice(0, 46) + "…"}
                  </span>
                </div>

                <div style={{ display: "grid", gap: 5, justifyItems: "end" }}>
                  <span className={`status-pill ${WARNA_PERAN[item.role] ?? "slate"}`}>
                    <i aria-hidden="true" />
                    {definisiPeran(item.role).label}
                  </span>
                  <span className={`status-pill ${WARNA_STATUS[item.status] ?? "slate"}`}>
                    <i aria-hidden="true" />
                    {item.status}
                  </span>
                </div>

                <div className="staff-phone" style={{ flexWrap: "wrap", gap: 7 }}>
                  <span style={{ marginRight: "auto" }}>
                    Masuk terakhir:{" "}
                    <strong style={{ color: "#5f7084", fontWeight: 600 }}>
                      {item.lastLoginAt ? formatDateTime(item.lastLoginAt) : "belum pernah"}
                    </strong>
                  </span>

                  {/* ubah peran */}
                  {!diriSendiri && !adminTerakhir ? (
                    <form action={ubahPeranUser} style={{ display: "flex", gap: 5 }}>
                      <input type="hidden" name="id" value={item.id} />
                      <select
                        name="role"
                        defaultValue={item.role}
                        aria-label={`Ubah peran ${item.username}`}
                        style={{
                          height: 24,
                          padding: "0 4px",
                          border: "1px solid #cedbe8",
                          borderRadius: 5,
                          color: "#456b91",
                          background: "#fff",
                          fontSize: 9,
                          fontWeight: 700,
                        }}
                      >
                        {PERAN.map((peran) => (
                          <option key={peran} value={peran}>
                            {DEFINISI[peran].label}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="mini-button" title="Simpan peran">
                        Simpan
                      </button>
                    </form>
                  ) : null}

                  {/* aktif / nonaktif */}
                  {!diriSendiri ? (
                    <form action={ubahStatusUser}>
                      <input type="hidden" name="id" value={item.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={item.status === "Aktif" ? "Nonaktif" : "Aktif"}
                      />
                      <button
                        type="submit"
                        className="mini-button"
                        title={item.status === "Aktif" ? "Nonaktifkan akun" : "Aktifkan akun"}
                      >
                        {item.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>
                  ) : null}

                  {/* reset kata sandi */}
                  <FormModal
                    action={resetSandiUser}
                    title={`Reset Sandi — ${item.name}`}
                    eyebrow="PENGELOLAAN AKSES"
                    trigger="Reset sandi"
                    triggerClass="mini-button"
                    triggerIcon={<IconKey size={11} />}
                    submitLabel="Reset sandi"
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <div className="form-grid">
                      <label className="field full">
                        <span>
                          Kata sandi baru untuk @{item.username} <b>*</b>
                        </span>
                        <input
                          name="password"
                          type="password"
                          required
                          placeholder="Minimal 8 karakter, ada huruf & angka"
                          autoComplete="new-password"
                        />
                      </label>
                      <div className="full">
                        <div className="notification-note">
                          <IconInfo size={14} />
                          <span>
                            Sesi aktif milik <strong>{item.name}</strong> akan langsung dihapus,
                            sehingga ia harus masuk kembali memakai kata sandi baru ini. Sampaikan
                            kata sandi itu kepadanya lewat jalur yang aman.
                          </span>
                        </div>
                      </div>
                    </div>
                  </FormModal>

                  {!diriSendiri && !adminTerakhir ? (
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="row-icon"
                        title={`Hapus akun ${item.username}`}
                        aria-label={`Hapus akun ${item.username}`}
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

      <p className="system-note" style={{ marginTop: 16, justifyContent: "center" }}>
        <IconInfo size={13} />
        <span>
          Mengubah peran atau status langsung menghapus sesi aktif pengguna tersebut, sehingga
          peran baru berlaku pada permintaan berikutnya. Administrator terakhir tidak dapat
          dihapus atau diturunkan perannya. Atur penerima disposisi di{" "}
          <Link href="/pegawai">halaman Pegawai</Link>.
        </span>
      </p>
    </>
  );
}
