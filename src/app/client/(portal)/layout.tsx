import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { getLegalSupportFooterConfig } from "@/lib/settings/legal-footer";

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, footerConfig] = await Promise.all([
    requireClientPortalSession(),
    getLegalSupportFooterConfig(),
  ]);

  return (
    <ClientPortalShell
      session={session}
      footerLinks={footerConfig.links}
      showFooter={footerConfig.showFooterInPortal}
    >
      {children}
    </ClientPortalShell>
  );
}
