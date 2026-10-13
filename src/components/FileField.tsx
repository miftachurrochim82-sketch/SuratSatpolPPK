"use client";

import { useState, type ChangeEvent } from "react";
import { IconUpload } from "@/components/Icons";

const BATAS_BYTE = 2 * 1024 * 1024; // 2 MB

/**
 * Membaca berkas di browser lalu mengirimnya sebagai base64 lewat
 * input tersembunyi, sesuai kolom base64_data di tabel attachments.
 */
export default function FileField({ label = "Lampiran berkas" }: { label?: string }) {
  const [nama, setNama] = useState("");
  const [ukuran, setUkuran] = useState("");
  const [galat, setGalat] = useState("");
  const [base64, setBase64] = useState("");
  const [mime, setMime] = useState("");

  function pilih(event: ChangeEvent<HTMLInputElement>) {
    const berkas = event.target.files?.[0];
    setGalat("");
    setNama("");
    setUkuran("");
    setBase64("");
    setMime("");

    if (!berkas) return;

    if (berkas.size > BATAS_BYTE) {
      setGalat("Berkas melebihi 2 MB. Kompres dulu atau pilih berkas lain.");
      event.target.value = "";
      return;
    }

    const pembaca = new FileReader();
    pembaca.onload = () => {
      const hasil = String(pembaca.result ?? "");
      // buang awalan "data:...;base64,"
      const dipisah = hasil.split(",");
      setBase64(dipisah[1] ?? "");
      setMime(berkas.type || "application/octet-stream");
      setNama(berkas.name);
      setUkuran(`${(berkas.size / 1024).toFixed(0)} KB`);
    };
    pembaca.onerror = () => setGalat("Berkas gagal dibaca. Coba lagi.");
    pembaca.readAsDataURL(berkas);
  }

  return (
    <label className="field full">
      <span>{label}</span>
      <div className="file-field">
        <IconUpload size={16} />
        <div>
          <strong>{nama || "Pilih berkas PDF atau gambar"}</strong>
          <small>
            {galat
              ? galat
              : ukuran
                ? `${ukuran} siap diunggah`
                : "Maksimal 2 MB · PDF, JPG, atau PNG"}
          </small>
        </div>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={pilih} />
      </div>

      <input type="hidden" name="attachmentData" value={base64} />
      <input type="hidden" name="attachmentName" value={nama} />
      <input type="hidden" name="attachmentMime" value={mime} />
    </label>
  );
}
