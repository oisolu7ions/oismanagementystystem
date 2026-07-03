import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { getDocumentById } from "@/actions/documents";
import { DocumentDeleteButton } from "@/components/documents/document-delete-button";
import { DocumentFileTypeBadge } from "@/components/documents/document-file-type-badge";
import { DocumentAttachmentButton } from "@/components/documents/document-attachment-button";
import { formatFileSize } from "@/lib/documents/constants";
import { EntityClientVisibilityToggle } from "@/components/client-sharing/entity-client-visibility-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type DocumentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: DocumentDetailPageProps) {
  const { id } = await params;
  const document = await getDocumentById(id);
  return { title: document?.name ?? "Document" };
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = await params;
  const document = await getDocumentById(id);

  if (!document) {
    notFound();
  }

  const displayClient =
    document.client ??
    (document.project?.client
      ? {
          id: document.project.client.id,
          name: document.project.client.name,
          businessName: document.project.client.businessName,
        }
      : null);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <BackLink fallbackHref="/dashboard/documents" />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{document.name}</h2>
            <DocumentFileTypeBadge fileType={document.fileType} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DocumentAttachmentButton
            documentId={document.id}
            sourceType={document.sourceType}
            url={document.url}
            size="md"
          />
          <Link href={`/dashboard/documents/${document.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <DocumentDeleteButton
            documentId={document.id}
            documentName={document.name}
          />
        </div>
      </div>

      <Card>
        <CardHeader
          title={document.sourceType === "FILE" ? "Uploaded file" : "Document URL"}
        />
        <CardBody className="space-y-3 text-sm">
          {document.sourceType === "FILE" ? (
            <>
              <p className="text-slate-700">
                <span className="font-medium text-slate-800">File:</span>{" "}
                {document.originalFileName ?? document.name}
              </p>
              {document.fileSize ? (
                <p className="text-slate-600">
                  <span className="font-medium text-slate-700">Size:</span>{" "}
                  {formatFileSize(document.fileSize)}
                </p>
              ) : null}
              {document.mimeType ? (
                <p className="text-slate-600">
                  <span className="font-medium text-slate-700">Type:</span>{" "}
                  {document.mimeType}
                </p>
              ) : null}
              <DocumentAttachmentButton
                documentId={document.id}
                sourceType={document.sourceType}
                url={document.url}
              />
            </>
          ) : (
            <>
              <p className="break-all text-slate-700">{document.url}</p>
              <DocumentAttachmentButton
                documentId={document.id}
                sourceType={document.sourceType}
                url={document.url}
              />
            </>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Client" />
          <CardBody className="text-sm">
            {displayClient ? (
              <>
                <Link
                  href={`/dashboard/clients/${displayClient.id}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {displayClient.name}
                </Link>
                {displayClient.businessName ? (
                  <p className="mt-1 text-slate-600">{displayClient.businessName}</p>
                ) : null}
              </>
            ) : (
              <p className="text-slate-600">No client linked</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Project" />
          <CardBody className="text-sm">
            {document.project ? (
              <Link
                href={`/dashboard/projects/${document.project.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {document.project.name}
              </Link>
            ) : (
              <p className="text-slate-600">No project linked</p>
            )}
          </CardBody>
        </Card>
      </div>

      {document.notes ? (
        <Card>
          <CardHeader title="Notes" />
          <CardBody>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {document.notes}
            </p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Client portal sharing" />
        <CardBody>
          <EntityClientVisibilityToggle
            entityType="document"
            entityId={document.id}
            clientVisible={document.clientVisible}
            clientNote={document.clientDescription}
            noteLabel="Client Description"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Record" />
        <CardBody className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-medium text-slate-700">Created:</span>{" "}
            {document.createdAt.toLocaleString()}
          </p>
          <p>
            <span className="font-medium text-slate-700">Updated:</span>{" "}
            {document.updatedAt.toLocaleString()}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
