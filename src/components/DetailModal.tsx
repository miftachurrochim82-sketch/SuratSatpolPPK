"use client";

import { useEffect, useState, type ReactNode } from "react";
import { IconClose, IconEye } from "@/components/Icons";

type DetailModalProps = {
  title: string;
  eyebrow?: string;
  label?: string;
  children: ReactNode;
};

export default function DetailModal({
  title,
  eyebrow = "RINCIAN BERKAS",
  label = "Detail",
  children,
}: DetailModalProps) {
  const [terbuka, setTerbuka] = useState(false);

  useEffect(() => {
    function tekanEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setTerbuka(false);
    }
    document.addEventListener("keydown", tekanEscape);
    return () => document.removeEventListener("keydown", tekanEscape);
  }, []);

  return (
    <>
      <button
        type="button"
        className="mini-button"
        onClick={() => setTerbuka(true)}
        aria-haspopup="dialog"
      >
        <IconEye size={12} /> {label}
      </button>

      {terbuka ? (
        <div className="modal-layer" role="dialog" aria-modal="true" aria-label={title}>
          <button
            type="button"
            className="modal-scrim"
            onClick={() => setTerbuka(false)}
            aria-label="Tutup"
          />
          <div className="modal">
            <div className="modal-head">
              <div>
                <p className="eyebrow">{eyebrow}</p>
                <h2>{title}</h2>
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
            <div className="modal-form">
              <dl className="verify-data" style={{ margin: 0 }}>
                {children}
              </dl>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setTerbuka(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
