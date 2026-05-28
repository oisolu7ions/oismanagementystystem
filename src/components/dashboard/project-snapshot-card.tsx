import Link from "next/link";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import type { DashboardMetrics } from "@/lib/dashboard/metrics";
import { formatProjectDate } from "@/lib/projects/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function ProjectSnapshotCard({
  snapshot,
}: {
  snapshot: DashboardMetrics["projectSnapshot"];
}) {
  return (
    <Card>
      <CardHeader
        title="Project snapshot"
        description="Active delivery status and recent updates."
      />
      <CardBody className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm text-blue-900">In progress</p>
            <p className="mt-1 text-2xl font-semibold text-blue-950">
              {snapshot.inProgress}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900">Waiting on client</p>
            <p className="mt-1 text-2xl font-semibold text-amber-950">
              {snapshot.waitingOnClient}
            </p>
          </div>
          <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
            <p className="text-sm text-violet-900">In review</p>
            <p className="mt-1 text-2xl font-semibold text-violet-950">
              {snapshot.inReview}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-800">Recently updated</p>
          {snapshot.recentlyUpdated.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No projects yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {snapshot.recentlyUpdated.map((project) => (
                <li key={project.id} className="px-4 py-3 text-sm">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="flex flex-col gap-1 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="font-medium text-slate-900">
                        {project.name}
                      </span>
                      <span className="mt-0.5 block text-slate-500">
                        {project.client.businessName ?? project.client.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ProjectStatusBadge status={project.status} />
                      <span className="text-xs text-slate-500">
                        {formatProjectDate(project.updatedAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          href="/dashboard/projects"
          className="inline-block text-sm font-medium text-slate-700 hover:underline"
        >
          View all projects →
        </Link>
      </CardBody>
    </Card>
  );
}
