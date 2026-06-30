import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientPortalProjectById } from "@/lib/client-portal/queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { getClientSafeActivityMessage } from "@/lib/client-portal/visibility";
import { formatProjectDate } from "@/lib/projects/constants";
import { getTaskStatusLabel, formatTaskDate } from "@/lib/tasks/constants";
import { getInvoiceStatusLabel } from "@/lib/invoices/constants";
import { getDocumentFileTypeLabel } from "@/lib/documents/constants";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectServiceTypeBadge } from "@/components/projects/project-service-type-badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ClientProjectPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ClientProjectPageProps) {
  const { id } = await params;
  const session = await requireClientPortalSession();
  const project = await getClientPortalProjectById(session.clientId, id);
  return { title: project?.name ?? "Project" };
}

export default async function ClientProjectDetailPage({ params }: ClientProjectPageProps) {
  const { id } = await params;
  const session = await requireClientPortalSession();
  const project = await getClientPortalProjectById(session.clientId, id);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/client/projects"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to projects
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            {project.name}
          </h1>
          <ProjectStatusBadge status={project.status} />
          <ProjectServiceTypeBadge serviceType={project.serviceType} />
        </div>
      </div>

      <Card>
        <CardHeader title="Project Status" />
        <CardBody className="space-y-4 text-sm">
          {project.clientSummary ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Summary
              </p>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">{project.clientSummary}</p>
            </div>
          ) : null}
          {project.clientStatusNote ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Status note
              </p>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">
                {project.clientStatusNote}
              </p>
            </div>
          ) : null}
          {!project.clientSummary && !project.clientStatusNote ? (
            <p className="text-slate-600">
              Your project is in progress. OIS will share updates here as work continues.
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Start date
              </p>
              <p className="mt-1 text-slate-900">{formatProjectDate(project.startDate)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Due date
              </p>
              <p className="mt-1 text-slate-900">{formatProjectDate(project.dueDate)}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {project.activities.length > 0 ? (
        <Card>
          <CardHeader title="Project Updates" />
          <CardBody className="space-y-3">
            {project.activities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
              >
                <p className="text-slate-800">{getClientSafeActivityMessage(activity)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {activity.createdAt.toLocaleString()}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Tasks" description={`${project.tasks.length} task(s)`} />
        <CardBody className="space-y-3">
          {project.tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks on this project yet.</p>
          ) : (
            project.tasks.map((task) => (
              <div key={task.id} className="rounded-lg border border-slate-200 p-4 text-sm">
                <p className="font-medium text-slate-900">{task.title}</p>
                <p className="mt-1 text-slate-600">
                  {getTaskStatusLabel(task.status)}
                  {task.dueDate ? ` · Due ${formatTaskDate(task.dueDate)}` : ""}
                </p>
                {task.clientNote ? (
                  <p className="mt-2 text-slate-600">{task.clientNote}</p>
                ) : null}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Invoices" />
        <CardBody className="space-y-3">
          {project.invoices.length === 0 ? (
            <p className="text-sm text-slate-500">No invoices for this project.</p>
          ) : (
            project.invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/client/invoices/${invoice.id}`}
                className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
              >
                <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {invoice.amount} · {getInvoiceStatusLabel(invoice.status)}
                </p>
                {invoice.clientNote ? (
                  <p className="mt-1 text-sm text-slate-500">{invoice.clientNote}</p>
                ) : null}
              </Link>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Documents" />
        <CardBody className="space-y-3">
          {project.documentLinks.length === 0 ? (
            <p className="text-sm text-slate-500">No documents linked to this project.</p>
          ) : (
            project.documentLinks.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{document.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {getDocumentFileTypeLabel(document.fileType)}
                  </p>
                  {document.clientDescription ? (
                    <p className="mt-1 text-sm text-slate-500">{document.clientDescription}</p>
                  ) : null}
                </div>
                {document.sourceType === "LINK" && document.url ? (
                  <a href={document.url} target="_blank" rel="noopener noreferrer">
                    <Button type="button" size="sm" variant="secondary">
                      Open link
                    </Button>
                  </a>
                ) : document.sourceType === "FILE" ? (
                  <a
                    href={`/api/client/documents/${document.id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button type="button" size="sm" variant="secondary">
                      Open file
                    </Button>
                  </a>
                ) : null}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
