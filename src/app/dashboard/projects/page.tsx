import Link from "next/link";
import { Suspense } from "react";
import {
  getActivePackagesForProjectFilter,
  getClientsForProjectFilter,
  searchProjects,
  type ProjectSearchParams,
} from "@/actions/projects";
import { PackageBadge } from "@/components/clients/package-badge";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectSearch } from "@/components/projects/project-search";
import { ProjectServiceTypeBadge } from "@/components/projects/project-service-type-badge";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { formatProjectDate } from "@/lib/projects/constants";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";

type ProjectsPageProps = {
  searchParams: Promise<ProjectSearchParams>;
};

export const metadata = {
  title: "Projects",
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const [projects, clients, packages] = await Promise.all([
    searchProjects(params),
    getClientsForProjectFilter(),
    getActivePackagesForProjectFilter(),
  ]);
  const hasFilters = Boolean(
    params.q || params.status || params.serviceType || params.clientId || params.packageId,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Projects</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage client deliverables — websites, integrations, dashboards, and more.
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader
          title="All projects"
          description={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
        />
        <CardBody className="space-y-4">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-100" />}>
            <ProjectSearch defaultValue={params.q ?? ""} />
          </Suspense>
          <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-slate-100" />}>
            <ProjectFilters
              currentStatus={params.status}
              currentServiceType={params.serviceType}
              currentClientId={params.clientId}
              currentPackageId={params.packageId}
              clients={clients}
              packages={packages}
            />
          </Suspense>

          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No projects found</p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try adjusting your search or filters."
                  : "Create your first project for a client."}
              </p>
              {!hasFilters ? (
                <Link href="/dashboard/projects/new" className="mt-4 inline-block">
                  <Button size="sm">Create project</Button>
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Package
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Due
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
                      <td className="px-4 py-3 text-slate-600">
                        <Link
                          href={`/dashboard/clients/${project.client.id}`}
                          className="font-medium text-slate-800 hover:underline"
                        >
                          {project.client.name}
                        </Link>
                        {project.client.businessName ? (
                          <div className="text-xs text-slate-500">
                            {project.client.businessName}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <ProjectServiceTypeBadge serviceType={project.serviceType} />
                      </td>
                      <td className="px-4 py-3">
                        {project.package ? (
                          <PackageBadge
                            name={project.package.name}
                            isActive={project.package.isActive}
                          />
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatProjectDate(project.dueDate)}
                      </td>
                      <td className="px-4 py-3">
                        <ProjectStatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/projects/${project.id}/edit`}
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
