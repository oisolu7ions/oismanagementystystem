import Link from "next/link";
import { createDocumentAction } from "@/actions/document-mutations";
import {
  getClientsForDocumentForm,
  getProjectForDocumentPrefill,
  getProjectsForDocumentForm,
} from "@/actions/documents";
import { DocumentForm } from "@/components/documents/document-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type NewDocumentPageProps = {
  searchParams: Promise<{ clientId?: string; projectId?: string }>;
};

export const metadata = {
  title: "New document",
};

export default async function NewDocumentPage({ searchParams }: NewDocumentPageProps) {
  const { clientId, projectId } = await searchParams;

  const project = projectId ? await getProjectForDocumentPrefill(projectId) : null;
  const resolvedClientId = clientId ?? project?.clientId;

  const [clients, projects] = await Promise.all([
    getClientsForDocumentForm(),
    getProjectsForDocumentForm(resolvedClientId),
  ]);

  const backHref = projectId
    ? `/dashboard/projects/${projectId}`
    : resolvedClientId
      ? `/dashboard/clients/${resolvedClientId}`
      : "/dashboard/documents";
  const backLabel = projectId
    ? "← Back to project"
    : resolvedClientId
      ? "← Back to client"
      : "← Back to documents";

  const relatedClientLabel = project?.client
    ? project.client.businessName
      ? `${project.client.name} — ${project.client.businessName}`
      : project.client.name
    : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={backHref}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          {backLabel}
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">New document link</h2>
        <p className="mt-1 text-sm text-slate-500">
          Paste a URL to a contract, proposal, branding folder, or other client file. Files
          are not uploaded to OIS Command Center.
        </p>
      </div>

      <Card>
        <CardHeader title="Document details" />
        <CardBody>
          <DocumentForm
            mode="create"
            action={createDocumentAction}
            clients={clients}
            projects={projects}
            initialValues={{
              clientId: resolvedClientId ?? undefined,
              projectId: projectId ?? undefined,
              fileType: "OTHER",
            }}
            lockClientId={Boolean(resolvedClientId && !projectId)}
            lockProjectId={Boolean(projectId)}
            relatedClientLabel={relatedClientLabel}
          />
        </CardBody>
      </Card>
    </div>
  );
}
