"use client";

import { useEffect, useRef, useState } from "react";
import { fokuskanPertama, kunciGulir, tahanFokus } from "@/lib/fokus";
import { IconCheck, IconClose, IconQr } from "@/components/Icons";

type QrModalProps = {
  code: string;
  nomor: string;
  perihal: string;
  tanda: string;
};

export default function QrModal({ code, nomor, perihal, tanda }: QrModalProps) {
  const [terbuka, setTerbuka] = useState(false);
  const wadah = useRef<HTMLDivElement>(null);
  const pemicu = useRef<HTMLButtonElement>(null);
  const [tautan, setTautan] = useState("");
  const [tersalin, setTersalin] = useState(false);

  function buka() {
    setTautan(`${window.location.origin}/verifikasi?code=${encodeURIComponent(code)}`);
    setTersalin(false);
    setTerbuka(true);
  }

  useEffect(() => {
    if (!terbuka) return;

    function tekanTombol(event: KeyboardEvent) {
      if (event.key === "Escape") setTerbuka(false);
      else tahanFokus(event, wadah.current);
    }

    const tombolPemicu = pemicu.current;
    document.addEventListener("keydown", tekanTombol);
    const bukaKunci = kunciGulir();
    fokuskanPertama(wadah.current);

    return () => {
      document.removeEventListener("keydown", tekanTombol);
      bukaKunci();
      tombolPemicu?.focus();
    };
  }, [terbuka]);

  async function salin() {
    try {
      await navigator.clipboard.writeText(tautan);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2500);
    } catch {
      setTersalin(false);
    }
  }

  return (
    <>
      <button
        ref={pemicu}
        type="button"
        className="mini-button"
        onClick={buka}
        aria-haspopup="dialog"
      >
        <IconQr size={12} /> QR
      </button>

      {terbuka ? (
        <div className="modal-layer" role="dialog" aria-modal="true" aria-label={`QR ${nomor}`}>
          <button
            type="button"
            className="modal-scrim"
            onClick={() => setTerbuka(false)}
            aria-label="Tutup"
          />
          <div className="modal modal-qr" ref={wadah}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">VERIFIKASI DOKUMEN</p>
                <h2>QR Code Surat</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setTerbuka(false)}
                aria-label="Tutup"
              >
                <IconClose size={15} />
              </button>
            </div>

            <div className="qr-preview">
              <div className="qr-frame">
                {/* PNG dibuat oleh /api/qr — ukurannya sudah tetap, jadi
                    optimasi next/image tidak memberi manfaat di sini */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/qr?code=${encodeURIComponent(code)}&size=420`}
                  alt={`QR code surat ${nomor}`}
                  width={420}
                  height={420}
                />
              </div>
              <div>
                <p className="eyebrow">KODE VERIFIKASI</p>
                <strong>{nomor}</strong>
                <p className="qr-copy">{perihal}</p>
                <p className="qr-copy">
                  Ditandatangani oleh <strong style={{ fontSize: 10 }}>{tanda}</strong>
                </p>
                <p className="qr-copy" style={{ marginTop: 12 }}>
                  Kode: <code>{code}</code>
                </p>
                <p className="qr-copy" style={{ marginTop: 10 }}>
                  Cetak QR ini di surat, atau kirimkan tautan di bawah. Penerima cukup memindai
                  untuk memeriksa keaslian dokumen.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <input
                readOnly
                value={tautan}
                onFocus={(event) => event.currentTarget.select()}
                aria-label="Tautan verifikasi"
                style={{
                  flex: 1,
                  minHeight: 37,
                  padding: "8px 10px",
                  border: "1px solid #dce4ec",
                  borderRadius: 6,
                  color: "#5f7188",
                  fontSize: 10,
                }}
              />
              <button type="button" className="button secondary" onClick={salin}>
                {tersalin ? (
                  <>
                    <IconCheck size={13} /> Tersalin
                  </>
                ) : (
                  "Salin tautan"
                )}
              </button>
              <button
                type="button"
                className="button primary"
                onClick={() => window.open(tautan, "_blank", "noopener")}
              >
                Buka halaman
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
