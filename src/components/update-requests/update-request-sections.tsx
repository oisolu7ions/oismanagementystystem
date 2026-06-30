import Link from "next/link";
import type { UpdateRequestRecord } from "@/actions/update-requests";
import {
  UpdateRequestPriorityBadge,
  UpdateRequestStatusBadge,
  UpdateRequestTypeBadge,
} from "@/components/update-requests/update-request-badges";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";

export function ClientUpdateRequestsSection({
  clientId,
  updateRequests,
  newHref,
}: {
  clientId: string;
  updateRequests: UpdateRequestRecord[];
  newHref?: string;
}) {
  const createHref = newHref ?? `/dashboard/update-requests/new?clientId=${clientId}`;

  return (
    <Card>
      <CardHeader
        title="Update Requests"
        description={`${updateRequests.length} request${updateRequests.length === 1 ? "" : "s"}`}
        action={
          <Link href={createHref}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Update Request
            </Button>
          </Link>
        }
      />
      <CardBody>
        {updateRequests.length === 0 ? (
          <p className="text-sm text-slate-500">No update requests for this client yet.</p>
        ) : (
          <ResponsiveTable>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Request</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Priority</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {updateRequests.slice(0, 10).map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/update-requests/${request.id}`}
                        className="font-medium text-slate-900 hover:underline"
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
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        )}
      </CardBody>
    </Card>
  );
}

export function ProjectUpdateRequestsSection({
  projectId,
  clientId,
  updateRequests,
}: {
  projectId: string;
  clientId: string;
  updateRequests: UpdateRequestRecord[];
}) {
  return (
    <ClientUpdateRequestsSection
      clientId={clientId}
      updateRequests={updateRequests}
      newHref={`/dashboard/update-requests/new?clientId=${clientId}&projectId=${projectId}`}
    />
  );
}
