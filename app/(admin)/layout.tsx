import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import { getSettings } from "@/lib/settings";
import { countPendingDispositions } from "@/lib/queries";
import { formatToday } from "@/lib/format";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [settings, pending] = await Promise.all([
    getSettings(),
    countPendingDispositions(),
  ]);

  return (
    <AppShell
      institutionName={settings.institution_name}
      institutionArea={settings.institution_area}
      letterCode={settings.letter_code}
      user="Admin TU"
      role="Tata Usaha"
      pendingDispositions={pending}
      today={formatToday()}
    >
      {children}
    </AppShell>
  );
}
