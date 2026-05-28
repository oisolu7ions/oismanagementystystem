import Link from "next/link";
import type { DashboardMetrics } from "@/lib/dashboard/metrics";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function TaskAlertsCard({
  taskAlerts,
}: {
  taskAlerts: DashboardMetrics["taskAlerts"];
}) {
  const { overdue, dueSoon } = taskAlerts;

  return (
    <Card>
      <CardHeader
        title="Task alerts"
        description="Quick view of upcoming and overdue work."
      />
      <CardBody className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900">Overdue tasks</p>
            <p className="mt-1 text-2xl font-semibold text-amber-950">{overdue}</p>
            {overdue > 0 ? (
              <Link
                href="/dashboard/tasks?overdue=1"
                className="mt-2 inline-block text-xs font-medium text-amber-800 hover:underline"
              >
                View overdue tasks →
              </Link>
            ) : (
              <p className="mt-1 text-xs text-amber-800">None overdue</p>
            )}
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm text-blue-900">Due in the next 7 days</p>
            <p className="mt-1 text-2xl font-semibold text-blue-950">{dueSoon}</p>
            <Link
              href="/dashboard/tasks?dueSoon=1"
              className="mt-2 inline-block text-xs font-medium text-blue-800 hover:underline"
            >
              View tasks due soon →
            </Link>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
