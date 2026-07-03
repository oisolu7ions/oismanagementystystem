import { BackLink } from "@/components/layout/back-link";
import { createDocumentAction } from "@/actions/document-mutations";
import {
  getClientsForDocumentForm,
  getProjectForDocumentPrefill,
  getProjectsForDocumentForm,
} from "@/actions/documents";
import { DocumentForm } from "@/components/documents/document-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getPortalDefaultSettings } from "@/lib/settings";

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

  const [clients, projects, portalDefaults] = await Promise.all([
    getClientsForDocumentForm(),
    getProjectsForDocumentForm(resolvedClientId),
    getPortalDefaultSettings(),
  ]);

  const backHref = projectId
    ? `/dashboard/projects/${projectId}`
    : resolvedClientId
      ? `/dashboard/clients/${resolvedClientId}`
      : "/dashboard/documents";

  const relatedClientLabel = project?.client
    ? project.client.businessName
      ? `${project.client.name} — ${project.client.businessName}`
      : project.client.name
    : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref={backHref} />
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">New document</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload a file or paste a link to a contract, proposal, logo, brief, or other
          client document.
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
              clientVisible: portalDefaults.defaultDocumentVisible,
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
