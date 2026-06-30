import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireClientPortalSession();

  return <ClientPortalShell session={session}>{children}</ClientPortalShell>;
}
