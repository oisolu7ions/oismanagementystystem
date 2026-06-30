import Link from "next/link";
import { Suspense } from "react";
import {
  getClientsForUpdateRequestFilter,
  getProjectsForUpdateRequestFilter,
  getUpdateRequestListSummary,
  searchUpdateRequests,
  type UpdateRequestSearchParams,
} from "@/actions/update-requests";
import {
  UpdateRequestPriorityBadge,
  UpdateRequestStatusBadge,
  UpdateRequestTypeBadge,
} from "@/components/update-requests/update-request-badges";
import { UpdateRequestFilters } from "@/components/update-requests/update-request-filters";
import { UpdateRequestSearch } from "@/components/update-requests/update-request-search";
import { UpdateRequestSummaryMetrics } from "@/components/update-requests/update-request-summary-metrics";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";

type UpdateRequestsPageProps = {
  searchParams: Promise<UpdateRequestSearchParams>;
};

export const metadata = {
  title: "Update Requests",
};

export default async function UpdateRequestsPage({ searchParams }: UpdateRequestsPageProps) {
  const params = await searchParams;
  const [updateRequests, clients, projects, summary] = await Promise.all([
    searchUpdateRequests(params),
    getClientsForUpdateRequestFilter(),
    getProjectsForUpdateRequestFilter(params.clientId),
    getUpdateRequestListSummary(params),
  ]);

  const hasFilters = Boolean(
    params.q || params.status || params.priority || params.requestType || params.clientId || params.projectId,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Update Requests</h2>
          <p className="mt-1 text-sm text-slate-500">
            Client-submitted change requests for websites, systems, and managed services.
          </p>
        </div>
        <Link href="/dashboard/update-requests/new">
          <Button>
            <Plus className="h-4 w-4" />
            New request
          </Button>
        </Link>
      </div>

      <UpdateRequestSummaryMetrics summary={summary} />

      <Card>
        <CardHeader
          title="All update requests"
          description={`${updateRequests.length} request${updateRequests.length === 1 ? "" : "s"}`}
        />
        <CardBody className="space-y-4">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-100" />}>
            <UpdateRequestSearch defaultValue={params.q ?? ""} />
          </Suspense>
          <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-slate-100" />}>
            <UpdateRequestFilters
              currentStatus={params.status}
              currentPriority={params.priority}
              currentRequestType={params.requestType}
              currentClientId={params.clientId}
              currentProjectId={params.projectId}
              clients={clients}
              projects={projects}
            />
          </Suspense>

          {updateRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No update requests found</p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try adjusting your search or filters."
                  : "Requests from the client portal will appear here."}
              </p>
            </div>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Request</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Client</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Project</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Priority</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {updateRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/dashboard/update-requests/${request.id}`}
                          className="hover:underline"
                        >
                          {request.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <Link
                          href={`/dashboard/clients/${request.client.id}`}
                          className="hover:underline"
                        >
                          {request.client.businessName ?? request.client.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {request.project ? (
                          <Link
                            href={`/dashboard/projects/${request.project.id}`}
                            className="hover:underline"
                          >
                            {request.project.name}
                          </Link>
                        ) : (
                          "—"
                        )}
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
