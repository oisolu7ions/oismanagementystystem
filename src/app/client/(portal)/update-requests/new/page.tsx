import Link from "next/link";
import { createClientUpdateRequestAction } from "@/actions/client-update-request-mutations";
import { getClientPortalProjectsForUpdateRequest } from "@/lib/client-portal/update-request-queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { ClientUpdateRequestForm } from "@/components/update-requests/client-update-request-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "New Update Request",
};

export default async function ClientNewUpdateRequestPage() {
  const session = await requireClientPortalSession();
  const projects = await getClientPortalProjectsForUpdateRequest(session.clientId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/client/update-requests"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to update requests
        </Link>
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
          <ClientUpdateRequestForm
            mode="create"
            action={createClientUpdateRequestAction}
            projects={projects}
          />
        </CardBody>
      </Card>
    </div>
  );
}
