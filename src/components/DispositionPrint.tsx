"use client";

import { useEffect, useState } from "react";
import { IconPrint } from "@/components/Icons";
import PrintPortal from "@/components/PrintPortal";

export type PrintDisposition = {
  id: string;
  letterNumber: string;
  subject: string;
  sender: string;
  securityLevel: string;
  letterDate: string;
  receivedDate: string;
  instruction: string;
  leaderNote: string | null;
  staffName: string;
  staffPosition: string;
  dispositionDate: string;
  dueDate: string | null;
};

type Props = {
  data: PrintDisposition;
  /** ringkasan singkat untuk QR di lembar cetak (opsional) */
  qrText?: string;
  institutionName: string;
  institutionArea: string;
  institutionAddress: string;
  headName: string;
  headPosition: string;
};

function formatTanggal(nilai: string | null) {
  if (!nilai) return "-";
  const tanggal = new Date(nilai);
  if (Number.isNaN(tanggal.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(tanggal);
}

/**
 * Tombol cetak lembar disposisi.
 *
 * Blok cetak hanya dirender sesaat sebelum mencetak, lalu dilepas kembali,
 * supaya tidak semua kartu disposisi ikut tercetak sekaligus.
 */
export default function DispositionPrint({
  data,
  qrText,
  institutionName,
  institutionArea,
  institutionAddress,
  headName,
  headPosition,
}: Props) {
  const [mencetak, setMencetak] = useState(false);
  const [pakaiQr, setPakaiQr] = useState(false);

  /*
   * Nama berkas PDF ditentukan judul halaman saat mencetak, jadi judulnya
   * diganti sebentar dengan nomor disposisi lalu dikembalikan lagi.
   */
  const namaBerkas = `Disposisi-${data.letterNumber.replace(/[^A-Za-z0-9]+/g, "-")}`;

  useEffect(() => {
    if (!mencetak) return;
    const judulSemula = document.title;
    document.title = namaBerkas;
    const kembalikan = () => {
      document.title = judulSemula;
    };
    window.addEventListener("afterprint", kembalikan, { once: true });

    const timer = setTimeout(() => {
      window.print();
      setMencetak(false);
    }, 150);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", kembalikan);
      document.title = judulSemula;
    };
  }, [mencetak, namaBerkas]);

  return (
    <>
      <button
        type="button"
        className="mini-button"
        onClick={() => setMencetak(true)}
        title={`Cetak lembar disposisi (berkas ${namaBerkas}.pdf)`}
      >
        <IconPrint size={11} /> Cetak
      </button>

      {qrText ? (
        <label className="mini-toggle" title="Sertakan QR ringkasan pada lembar yang dicetak">
          <input
            type="checkbox"
            checked={pakaiQr}
            onChange={(event) => setPakaiQr(event.target.checked)}
            aria-label="Sertakan QR ringkasan pada lembar cetak"
          />
          QR
        </label>
      ) : null}

      {mencetak ? (
        <PrintPortal>
          <article className="print-disposition">
            <header>
              <div className="print-logo" aria-hidden="true">
                PPK
              </div>
              <div>
                <h1>{institutionName}</h1>
                <p>{institutionArea}</p>
                <p>{institutionAddress}</p>
                <span>LEMBAR DISPOSISI</span>
              </div>
            </header>

            <div className="print-grid">
              <p>
                <b>Nomor agenda</b>
                <span>{data.letterNumber}</span>
              </p>
              <p>
                <b>Tanggal surat</b>
                <span>{formatTanggal(data.letterDate)}</span>
              </p>
              <p>
                <b>Asal surat</b>
                <span>{data.sender}</span>
              </p>
              <p>
                <b>Diterima</b>
                <span>{formatTanggal(data.receivedDate)}</span>
              </p>
              <p>
                <b>Sifat</b>
                <span>{data.securityLevel}</span>
              </p>
              <p>
                <b>Tanggal disposisi</b>
                <span>{formatTanggal(data.dispositionDate)}</span>
              </p>
              <p className="wide">
                <b>Perihal</b>
                <span>{data.subject}</span>
              </p>
              <p className="wide">
                <b>Didisposisikan kepada</b>
                <span>
                  {data.staffName} — {data.staffPosition}
                </span>
              </p>
              <p className="wide">
                <b>Instruksi</b>
                <span>{data.instruction}</span>
              </p>
              <p className="wide">
                <b>Catatan pimpinan</b>
                <span>{data.leaderNote || "-"}</span>
              </p>
              <p className="wide">
                <b>Batas waktu</b>
                <span>{formatTanggal(data.dueDate)}</span>
              </p>
            </div>

            <footer>
              <div>
                <span>Penerima disposisi</span>
                <strong>{data.staffName}</strong>
              </div>

              {pakaiQr && qrText ? (
                <div className="print-qr">
                  {/* QR memuat ringkasan apa adanya: bisa dipindai tanpa jaringan */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/qr?text=${encodeURIComponent(qrText)}&size=200`}
                    alt="QR ringkasan disposisi"
                  />
                  <span>Pindai untuk ringkasan disposisi</span>
                </div>
              ) : null}
              <div>
                <span>{institutionArea}</span>
                <strong>
                  {headName}
                  <br />
                  <span style={{ fontSize: 9 }}>{headPosition}</span>
                </strong>
              </div>
            </footer>
          </article>
        </PrintPortal>
      ) : null}
    </>
  );
}
