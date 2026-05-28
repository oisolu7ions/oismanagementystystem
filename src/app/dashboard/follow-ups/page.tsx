import Link from "next/link";
import { Suspense } from "react";
import {
  getClientsForFollowUpFilter,
  getFollowUpListSummary,
  getLeadsForFollowUpFilter,
  searchFollowUps,
  type FollowUpSearchParams,
} from "@/actions/follow-ups";
import { FollowUpDueDate } from "@/components/follow-ups/follow-up-due-date";
import { FollowUpFilters } from "@/components/follow-ups/follow-up-filters";
import { FollowUpReasonBadge } from "@/components/follow-ups/follow-up-reason-badge";
import { FollowUpSearch } from "@/components/follow-ups/follow-up-search";
import { FollowUpStatusBadge } from "@/components/follow-ups/follow-up-status-badge";
import { FollowUpSummaryMetrics } from "@/components/follow-ups/follow-up-summary-metrics";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";

type FollowUpsPageProps = {
  searchParams: Promise<FollowUpSearchParams>;
};

export const metadata = {
  title: "Follow-ups",
};

export default async function FollowUpsPage({ searchParams }: FollowUpsPageProps) {
  const params = await searchParams;
  const [followUps, leads, clients, summary] = await Promise.all([
    searchFollowUps(params),
    getLeadsForFollowUpFilter(),
    getClientsForFollowUpFilter(),
    getFollowUpListSummary(params),
  ]);
  const hasFilters = Boolean(
    params.q ||
      params.status ||
      params.reason ||
      params.leadId ||
      params.clientId ||
      params.dueToday ||
      params.overdue ||
      params.upcoming,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Follow-ups</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manual reminders for leads and clients — no automated email or SMS yet.
          </p>
        </div>
        <Link href="/dashboard/follow-ups/new">
          <Button>
            <Plus className="h-4 w-4" />
            New follow-up
          </Button>
        </Link>
      </div>

      <FollowUpSummaryMetrics summary={summary} />

      <Card>
        <CardHeader
          title="All follow-ups"
          description={`${followUps.length} follow-up${followUps.length === 1 ? "" : "s"}`}
        />
        <CardBody className="space-y-4">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-100" />}>
            <FollowUpSearch defaultValue={params.q ?? ""} />
          </Suspense>
          <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-slate-100" />}>
            <FollowUpFilters
              currentStatus={params.status}
              currentReason={params.reason}
              currentLeadId={params.leadId}
              currentClientId={params.clientId}
              currentDueToday={params.dueToday}
              currentOverdue={params.overdue}
              currentUpcoming={params.upcoming}
              leads={leads}
              clients={clients}
            />
          </Suspense>

          {followUps.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No follow-ups found</p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try adjusting your search or filters."
                  : "Schedule your first reminder for a lead or client."}
              </p>
              {!hasFilters ? (
                <Link href="/dashboard/follow-ups/new" className="mt-4 inline-block">
                  <Button size="sm">Create follow-up</Button>
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Lead / Client
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {followUps.map((followUp) => (
                    <tr key={followUp.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/follow-ups/${followUp.id}`}
                          className="inline-flex hover:underline"
                        >
                          <FollowUpReasonBadge reason={followUp.reason} />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {followUp.lead ? (
                          <div>
                            <Link
                              href={`/dashboard/leads/${followUp.lead.id}`}
                              className="font-medium text-slate-800 hover:underline"
                            >
                              {followUp.lead.name}
                            </Link>
                            <div className="text-xs text-slate-500">Lead</div>
                          </div>
                        ) : followUp.client ? (
                          <div>
                            <Link
                              href={`/dashboard/clients/${followUp.client.id}`}
                              className="font-medium text-slate-800 hover:underline"
                            >
                              {followUp.client.name}
                            </Link>
                            <div className="text-xs text-slate-500">Client</div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <FollowUpDueDate
                          followUpDate={followUp.followUpDate}
                          status={followUp.status}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <FollowUpStatusBadge status={followUp.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/follow-ups/${followUp.id}/edit`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
