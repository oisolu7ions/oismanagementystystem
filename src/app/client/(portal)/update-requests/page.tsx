import Link from "next/link";
import { getClientPortalUpdateRequests } from "@/lib/client-portal/update-request-queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import {
  UpdateRequestPriorityBadge,
  UpdateRequestStatusBadge,
  UpdateRequestTypeBadge,
} from "@/components/update-requests/update-request-badges";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";
import { getPortalDefaultSettings } from "@/lib/settings";

export const metadata = {
  title: "Update Requests",
};

export default async function ClientUpdateRequestsPage() {
  const session = await requireClientPortalSession();
  const [updateRequests, portalDefaults] = await Promise.all([
    getClientPortalUpdateRequests(session.clientId),
    getPortalDefaultSettings(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Update Requests</h1>
          <p className="mt-1 text-sm text-slate-500">
            Request changes to your website, portal, dashboard, or managed systems.
          </p>
        </div>
        {portalDefaults.defaultUpdateRequestsEnabled ? (
          <Link href="/client/update-requests/new">
            <Button>
              <Plus className="h-4 w-4" />
              New request
            </Button>
          </Link>
        ) : null}
      </div>

      <Card>
        <CardHeader
          title="Your requests"
          description={`${updateRequests.length} request${updateRequests.length === 1 ? "" : "s"}`}
        />
        <CardBody>
          {updateRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No update requests yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Submit a request when you need content, design, or system changes.
              </p>
              {portalDefaults.defaultUpdateRequestsEnabled ? (
                <Link href="/client/update-requests/new" className="mt-4 inline-block">
                  <Button size="sm">Submit request</Button>
                </Link>
              ) : null}
            </div>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Request</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Priority</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Project</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {updateRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/client/update-requests/${request.id}`}
                          className="hover:underline"
                        >
                          {request.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <UpdateRequestTypeBadge type={request.requestType} />
                      </td>
                      <td className="px-4 py-3">
                        <UpdateRequestPriorityBadge priority={request.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <UpdateRequestStatusBadge status={request.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {request.project?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {request.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
