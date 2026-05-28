import Link from "next/link";
import { FollowUpDueDate } from "@/components/follow-ups/follow-up-due-date";
import { FollowUpReasonBadge } from "@/components/follow-ups/follow-up-reason-badge";
import type { DashboardMetrics } from "@/lib/dashboard/metrics";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function FollowUpAlertsCard({
  followUpAlerts,
}: {
  followUpAlerts: DashboardMetrics["followUpAlerts"];
}) {
  const { dueToday, overdue, nextPending } = followUpAlerts;

  return (
    <Card>
      <CardHeader
        title="Follow-up reminders"
        description="Due today, overdue, and your next pending follow-ups."
      />
      <CardBody className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm text-blue-900">Due today</p>
            <p className="mt-1 text-2xl font-semibold text-blue-950">{dueToday}</p>
            <Link
              href="/dashboard/follow-ups?dueToday=1"
              className="mt-2 inline-block text-xs font-medium text-blue-800 hover:underline"
            >
              View due today →
            </Link>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900">Overdue</p>
            <p className="mt-1 text-2xl font-semibold text-amber-950">{overdue}</p>
            <Link
              href="/dashboard/follow-ups?overdue=1"
              className="mt-2 inline-block text-xs font-medium text-amber-800 hover:underline"
            >
              View overdue →
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-800">Next pending follow-ups</p>
          {nextPending.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No pending follow-ups scheduled.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {nextPending.map((followUp) => (
                <li key={followUp.id} className="px-4 py-3 text-sm">
                  <Link
                    href={`/dashboard/follow-ups/${followUp.id}`}
                    className="flex flex-col gap-1 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <FollowUpReasonBadge reason={followUp.reason} />
                      <span className="text-slate-600">
                        {followUp.lead?.name ?? followUp.client?.name ?? "—"}
                      </span>
                    </div>
                    <FollowUpDueDate
                      followUpDate={followUp.followUpDate}
                      status={followUp.status}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
