import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import { getSettings } from "@/lib/settings";
import { countPendingDispositions } from "@/lib/queries";
import { formatToday } from "@/lib/format";
import { wajibMasuk } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Semua halaman di grup (admin) wajib punya sesi. Bila tidak, dialihkan ke /login.
  // Pemeriksaan di sini mengamankan tampilan; setiap server action juga
  // memeriksa izinnya sendiri, karena action bisa dipanggil langsung.
  const pengguna = await wajibMasuk();

  const [settings, pending] = await Promise.all([
    getSettings(),
    countPendingDispositions(pengguna),
  ]);

  return (
    <AppShell
      institutionArea={settings.institution_area}
      letterCode={settings.letter_code}
      user={{
        name: pengguna.name,
        username: pengguna.username,
        role: pengguna.role,
      }}
      pendingDispositions={pending}
      today={formatToday()}
    >
      {children}
    </AppShell>
  );
}
