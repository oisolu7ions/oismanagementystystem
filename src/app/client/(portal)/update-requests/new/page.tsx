import { BackLink } from "@/components/layout/back-link";
import { createClientUpdateRequestAction } from "@/actions/client-update-request-mutations";
import { getClientPortalProjectsForUpdateRequest } from "@/lib/client-portal/update-request-queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { getPortalDefaultSettings } from "@/lib/settings";
import { ClientUpdateRequestForm } from "@/components/update-requests/client-update-request-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "New Update Request",
};

export default async function ClientNewUpdateRequestPage() {
  const session = await requireClientPortalSession();
  const [projects, portalDefaults] = await Promise.all([
    getClientPortalProjectsForUpdateRequest(session.clientId),
    getPortalDefaultSettings(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref="/client/update-requests" />
        <h1 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          Submit Update Request
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell OIS what you need changed on your website, portal, or managed systems.
        </p>
      </div>

      <Card>
        <CardHeader title="Request details" />
        <CardBody>
          {portalDefaults.defaultUpdateRequestsEnabled ? (
            <ClientUpdateRequestForm
              mode="create"
              action={createClientUpdateRequestAction}
              projects={projects}
            />
          ) : (
            <p className="text-sm text-slate-500">
              New update requests are not currently available for this portal.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
