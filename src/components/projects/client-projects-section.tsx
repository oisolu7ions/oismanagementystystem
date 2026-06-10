import Link from "next/link";
import type { ProjectStatus, ServiceType } from "@/generated/prisma/client";
import { formatProjectDate } from "@/lib/projects/constants";
import { ProjectServiceTypeBadge } from "@/components/projects/project-service-type-badge";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";

type ClientProject = {
  id: string;
  name: string;
  status: ProjectStatus;
  serviceType: ServiceType;
  dueDate: Date | null;
  package: { id: string; name: string; isActive: boolean } | null;
};

export function ClientProjectsSection({
  clientId,
  projects,
}: {
  clientId: string;
  projects: ClientProject[];
}) {
  return (
    <Card>
      <CardHeader
        title="Projects"
        description={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
        action={
          <Link href={`/dashboard/projects/new?clientId=${clientId}`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New project
            </Button>
          </Link>
        }
      />
      <CardBody>
        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No projects yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Start a website build, integration, or other deliverable for this client.
            </p>
            <Link
              href={`/dashboard/projects/new?clientId=${clientId}`}
              className="mt-4 inline-block"
            >
              <Button size="sm">Create first project</Button>
            </Link>
          </div>
        ) : (
          <ResponsiveTable>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Due
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="hover:underline"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <ProjectServiceTypeBadge serviceType={project.serviceType} />
                    </td>
                    <td className="px-4 py-3">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatProjectDate(project.dueDate)}
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
