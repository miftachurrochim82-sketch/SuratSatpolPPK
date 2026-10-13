import QRCode from "qrcode";

export const dynamic = "force-dynamic";

/**
 * Mengembalikan gambar QR (PNG) untuk sebuah kode verifikasi.
 * QR memuat URL lengkap halaman verifikasi supaya bisa langsung dipindai.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = (url.searchParams.get("code") ?? "").trim().toUpperCase();

  if (!code) {
    return new Response("Parameter code wajib diisi.", { status: 400 });
  }

  const ukuran = Number(url.searchParams.get("size") ?? 420);
  const lebar = Number.isFinite(ukuran) ? Math.min(Math.max(ukuran, 120), 1000) : 420;

  const origin =
    request.headers.get("x-forwarded-host") && request.headers.get("x-forwarded-proto")
      ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
      : url.origin;

  const tautan = `${origin}/verifikasi?code=${encodeURIComponent(code)}`;

  try {
    const png = await QRCode.toBuffer(tautan, {
      type: "png",
      width: lebar,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#172a45", light: "#ffffff" },
    });

    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Gagal membuat QR code.", { status: 500 });
  }
}
