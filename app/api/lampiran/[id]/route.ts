import { eq } from "drizzle-orm";
import { db } from "@/db";
import { attachments } from "@/db/schema";

export const dynamic = "force-dynamic";

/** Menyajikan lampiran yang tersimpan sebagai base64 di tabel attachments. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const nomor = Number(id);

  if (!Number.isInteger(nomor) || nomor <= 0) {
    return new Response("ID lampiran tidak valid.", { status: 400 });
  }

  try {
    const [row] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, nomor))
      .limit(1);

    if (!row) {
      return new Response("Lampiran tidak ditemukan.", { status: 404 });
    }

    const isi = Buffer.from(row.base64Data, "base64");
    const namaAman = row.fileName.replace(/["\r\n]/g, "");

    return new Response(new Uint8Array(isi), {
      headers: {
        "Content-Type": row.mimeType || "application/octet-stream",
        "Content-Length": String(isi.byteLength),
        "Content-Disposition": `inline; filename="${namaAman}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Gagal membaca lampiran.", { status: 500 });
  }
}
