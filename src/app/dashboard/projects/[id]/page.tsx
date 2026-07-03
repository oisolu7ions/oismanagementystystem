import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { getProjectById } from "@/actions/projects";
import { getActivityByProjectId } from "@/actions/activity";
import { getUpdateRequestsByProjectId } from "@/actions/update-requests";
import { getDocumentsByProjectId } from "@/actions/documents";
import { getInvoicesByProjectId } from "@/actions/invoices";
import { ProjectDocumentsSection } from "@/components/documents/project-documents-section";
import { getTasksByProjectId } from "@/actions/tasks";
import { ProjectInvoicesSection } from "@/components/invoices/project-invoices-section";
import { ProjectTasksSection } from "@/components/tasks/project-tasks-section";
import { PackageBadge } from "@/components/clients/package-badge";
import { ProjectDeleteButton } from "@/components/projects/project-delete-button";
import { ProjectServiceTypeBadge } from "@/components/projects/project-service-type-badge";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ActivityAdminTimeline } from "@/components/client-sharing/activity-admin-timeline";
import { ProjectClientSharingPanel } from "@/components/client-sharing/project-client-sharing-panel";
import { ProjectUpdateRequestsSection } from "@/components/update-requests/update-request-sections";
import { formatProjectDate } from "@/lib/projects/constants";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const [project, tasks, invoices, documents, activities, updateRequests] = await Promise.all([
    getProjectById(id),
    getTasksByProjectId(id),
    getInvoicesByProjectId(id),
    getDocumentsByProjectId(id),
    getActivityByProjectId(id),
    getUpdateRequestsByProjectId(id),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <BackLink fallbackHref="/dashboard/projects" />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{project.name}</h2>
            <ProjectStatusBadge status={project.status} />
            <ProjectServiceTypeBadge serviceType={project.serviceType} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <ProjectDeleteButton projectId={project.id} projectName={project.name} />
        </div>
      </div>

      <Card>
        <CardHeader title="Client" />
        <CardBody className="space-y-2 text-sm">
          <p>
            <Link
              href={`/dashboard/clients/${project.client.id}`}
              className="font-medium text-slate-900 hover:underline"
            >
              {project.client.name}
            </Link>
          </p>
          {project.client.businessName ? (
            <p className="text-slate-600">{project.client.businessName}</p>
          ) : null}
          {project.client.email ? (
            <p className="text-slate-600">{project.client.email}</p>
          ) : null}
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Commercial" />
          <CardBody className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                OIS package
              </p>
              <div className="mt-1">
                {project.package ? (
                  <PackageBadge
                    name={project.package.name}
                    isActive={project.package.isActive}
                  />
                ) : (
                  <span className="text-slate-600">No package assigned</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Price
              </p>
              <p className="mt-1 text-slate-900">{project.price ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Monthly fee
              </p>
              <p className="mt-1 text-slate-900">{project.monthlyFee ?? "—"}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Timeline" />
          <CardBody className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Start date
              </p>
              <p className="mt-1 text-slate-900">
                {formatProjectDate(project.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Due date
              </p>
              <p className="mt-1 text-slate-900">{formatProjectDate(project.dueDate)}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {project.description ? (
        <Card>
          <CardHeader title="Description" />
          <CardBody>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {project.description}
            </p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="Client portal sharing"
          description="Control what this client can see in their portal"
        />
        <CardBody>
          <ProjectClientSharingPanel
            projectId={project.id}
            clientVisible={project.clientVisible}
            clientSummary={project.clientSummary}
            clientStatusNote={project.clientStatusNote}
          />
        </CardBody>
      </Card>

      <ProjectTasksSection
        projectId={project.id}
        serviceType={project.serviceType}
        tasks={tasks}
      />

      <Card>
        <CardHeader title="Record" />
        <CardBody className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-medium text-slate-700">Created:</span>{" "}
            {project.createdAt.toLocaleString()}
          </p>
          <p>
            <span className="font-medium text-slate-700">Updated:</span>{" "}
            {project.updatedAt.toLocaleString()}
          </p>
        </CardBody>
      </Card>

      <ProjectInvoicesSection
        projectId={project.id}
        clientId={project.clientId}
        invoices={invoices}
      />

      <ProjectDocumentsSection projectId={project.id} documents={documents} />

      <ProjectUpdateRequestsSection
        projectId={project.id}
        clientId={project.clientId}
        updateRequests={updateRequests}
      />

      <Card>
        <CardHeader title="Project notes" description="Coming in a future phase." />
        <CardBody>
          <p className="text-sm text-slate-500">
            Structured note records will complement the project description above.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Activity timeline"
          description="Automatic history for this project"
        />
        <CardBody>
          <ActivityAdminTimeline activities={activities} />
        </CardBody>
      </Card>
    </div>
  );
}
