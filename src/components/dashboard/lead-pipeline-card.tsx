import Link from "next/link";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import type { DashboardMetrics } from "@/lib/dashboard/metrics";
import { formatFollowUpDate, leadStatusOptions } from "@/lib/leads/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function LeadPipelineCard({
  pipeline,
}: {
  pipeline: DashboardMetrics["leadPipeline"];
}) {
  return (
    <Card>
      <CardHeader
        title="Lead pipeline"
        description="Counts by status and recently captured leads."
      />
      <CardBody className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">Total active leads</p>
          <p className="text-2xl font-semibold text-slate-900">
            {pipeline.activeLeads}
          </p>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {leadStatusOptions.map((option) => (
            <li
              key={option.value}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
            >
              <span className="text-slate-700">{option.label}</span>
              <span className="font-semibold text-slate-900">
                {pipeline.byStatus[option.value]}
              </span>
            </li>
          ))}
        </ul>

        <div>
          <p className="text-sm font-medium text-slate-800">Recently created</p>
          {pipeline.recentLeads.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No leads yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {pipeline.recentLeads.map((lead) => (
                <li key={lead.id} className="px-4 py-3 text-sm">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="flex flex-col gap-1 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-medium text-slate-900">{lead.name}</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <LeadStatusBadge status={lead.status} />
                      <span className="text-xs text-slate-500">
                        {formatFollowUpDate(lead.createdAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          href="/dashboard/leads"
          className="inline-block text-sm font-medium text-slate-700 hover:underline"
        >
          View all leads →
        </Link>
      </CardBody>
    </Card>
  );
}
