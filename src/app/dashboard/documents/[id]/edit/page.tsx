import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { updateDocumentAction } from "@/actions/document-mutations";
import {
  getClientsForDocumentForm,
  getDocumentById,
  getProjectsForDocumentForm,
} from "@/actions/documents";
import { DocumentForm } from "@/components/documents/document-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type EditDocumentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditDocumentPageProps) {
  const { id } = await params;
  const document = await getDocumentById(id);
  return { title: document ? `Edit ${document.name}` : "Edit document" };
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const { id } = await params;
  const document = await getDocumentById(id);

  if (!document) {
    notFound();
  }

  const clientId =
    document.clientId ?? document.project?.client?.id ?? undefined;

  const [clients, projects] = await Promise.all([
    getClientsForDocumentForm(),
    getProjectsForDocumentForm(clientId),
  ]);

  const boundUpdate = updateDocumentAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref={`/dashboard/documents/${document.id}`} />
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          Edit {document.name}
        </h2>
      </div>

      <Card>
        <CardHeader title="Document details" />
        <CardBody>
          <DocumentForm
            mode="edit"
            action={boundUpdate}
            clients={clients}
            projects={projects}
            initialValues={{
              name: document.name,
              fileType: document.fileType,
              sourceType: document.sourceType,
              url: document.url ?? undefined,
              originalFileName: document.originalFileName,
              fileSize: document.fileSize,
              notes: document.notes ?? undefined,
              clientId,
              projectId: document.projectId ?? undefined,
              clientVisible: document.clientVisible,
              clientDescription: document.clientDescription ?? undefined,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
