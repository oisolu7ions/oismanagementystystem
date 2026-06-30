import Link from "next/link";
import { getClientPortalProjects } from "@/lib/client-portal/queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { formatProjectDate } from "@/lib/projects/constants";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectServiceTypeBadge } from "@/components/projects/project-service-type-badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";

export const metadata = {
  title: "Projects",
};

export default async function ClientProjectsPage() {
  const session = await requireClientPortalSession();
  const projects = await getClientPortalProjects(session.clientId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Projects</h1>
        <p className="mt-1 text-sm text-slate-500">Your work in progress with OIS.</p>
      </div>

      <Card>
        <CardHeader
          title="All projects"
          description={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
        />
        <CardBody>
          {projects.length === 0 ? (
            <p className="text-sm text-slate-500">No projects to display.</p>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Project</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Service</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/client/projects/${project.id}`}
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
    </div>
  );
}
