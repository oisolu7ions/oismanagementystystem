import Link from "next/link";
import type { ClientUser } from "@/generated/prisma/client";
import { ClientPortalAccessSection } from "@/components/clients/client-portal-access-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ClientPortalControlsSection({
  clientId,
  users,
  hasPortalAccess,
}: {
  clientId: string;
  users: ClientUser[];
  hasPortalAccess: boolean;
}) {
  const activeUsers = users.filter((user) => user.isActive);
  const lastLogin = users
    .map((user) => user.lastLoginAt)
    .filter(Boolean)
    .sort((a, b) => (b!.getTime() ?? 0) - (a!.getTime() ?? 0))[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Portal access
          </p>
          <div className="mt-2">
            <Badge variant={hasPortalAccess ? "success" : "muted"}>
              {hasPortalAccess ? "Enabled" : "Not enabled"}
            </Badge>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Active users
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{activeUsers.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Last login
          </p>
          <p className="mt-2 text-sm text-slate-700">
            {lastLogin ? lastLogin.toLocaleString() : "Never"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/dashboard/projects?clientId=${clientId}`}>
          <Button type="button" size="sm" variant="secondary">
            Manage project visibility
          </Button>
        </Link>
        <Link href="/client/login" target="_blank" rel="noopener noreferrer">
          <Button type="button" size="sm" variant="secondary">
            Open client login
          </Button>
        </Link>
      </div>

      <ClientPortalAccessSection
        clientId={clientId}
        users={users}
        hasPortalAccess={hasPortalAccess}
      />
    </div>
  );
}
