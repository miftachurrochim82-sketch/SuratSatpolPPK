"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { fokuskanPertama, kunciGulir, tahanFokus } from "@/lib/fokus";
import { IconAlert, IconCheck, IconClose } from "@/components/Icons";
import {
  EMPTY_STATE,
  type ActionHandler,
  type ActionState,
} from "@/lib/action-state";

type FormModalProps = {
  action: ActionHandler;
  title: string;
  eyebrow?: string;
  trigger: string;
  triggerClass?: string;
  triggerIcon?: ReactNode;
  children: ReactNode;
  submitLabel?: string;
  wide?: boolean;
};

export default function FormModal({
  action,
  title,
  eyebrow,
  trigger,
  triggerClass = "button primary",
  triggerIcon,
  children,
  submitLabel = "Simpan",
  wide = false,
}: FormModalProps) {
  const [terbuka, setTerbuka] = useState(false);
  const wadah = useRef<HTMLDivElement>(null);
  const pemicu = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const [galat, setGalat] = useState("");
  const [toast, setToast] = useState<ActionState | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function buka() {
    setGalat("");
    setTerbuka(true);
  }

  /**
   * Server action dipanggil langsung dari event handler (bukan lewat useActionState),
   * supaya penutupan modal dan notifikasi tidak perlu dijalankan di dalam effect.
   */
  async function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setGalat("");

    try {
      const hasil = await action(EMPTY_STATE, formData);
      if (hasil.ok) {
        formRef.current?.reset();
        setTerbuka(false);
        setToast(hasil);
      } else {
        setGalat(hasil.message || "Isian belum lengkap.");
      }
    } catch {
      setGalat("Terjadi gangguan saat menyimpan. Silakan coba lagi.");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

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

  return (
    <>
      <button
        ref={pemicu}
        type="button"
        className={triggerClass}
        onClick={buka}
        aria-haspopup="dialog"
      >
        {triggerIcon}
        {trigger}
      </button>

      {terbuka ? (
        <div className="modal-layer" role="dialog" aria-modal="true" aria-label={title}>
          <button type="button" className="modal-scrim" onClick={() => setTerbuka(false)} aria-label="Tutup" />
          <div className={`modal${wide ? " modal-qr" : ""}`} ref={wadah}>
            <div className="modal-head">
              <div>
                {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
                <h2>{title}</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setTerbuka(false)}
                aria-label="Tutup formulir"
              >
                <IconClose size={15} />
              </button>
            </div>

            <form className="modal-form" ref={formRef} onSubmit={kirim}>
              {galat ? (
                <p className="notification-note" role="alert" style={{ marginBottom: 14 }}>
                  <IconAlert size={14} />
                  <span>{galat}</span>
                </p>
              ) : null}

              {children}

              <div className="modal-actions">
                <button type="button" className="button secondary" onClick={() => setTerbuka(false)}>
                  Batal
                </button>
                <button type="submit" className="button primary" disabled={pending}>
                  {pending ? "Menyimpan…" : submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={`toast ${toast.ok ? "success" : "error"}`} role="status" aria-live="polite">
          <span aria-hidden="true">{toast.ok ? <IconCheck size={11} /> : "!"}</span>
          {toast.message}
          <button type="button" onClick={() => setToast(null)} aria-label="Tutup notifikasi">
            <IconClose size={12} />
          </button>
        </div>
      ) : null}
    </>
  );
}
