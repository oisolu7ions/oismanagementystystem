import Link from "next/link";
import { Suspense } from "react";
import {
  getClientsForDocumentFilter,
  getProjectsForDocumentFilter,
  searchDocuments,
  type DocumentSearchParams,
} from "@/actions/documents";
import { DocumentFileTypeBadge } from "@/components/documents/document-file-type-badge";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentAttachmentButton } from "@/components/documents/document-attachment-button";
import { DocumentSearch } from "@/components/documents/document-search";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";

type DocumentsPageProps = {
  searchParams: Promise<DocumentSearchParams>;
};

export const metadata = {
  title: "Documents",
};

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
  const [documents, clients, projects] = await Promise.all([
    searchDocuments(params),
    getClientsForDocumentFilter(),
    getProjectsForDocumentFilter(),
  ]);
  const hasFilters = Boolean(
    params.q || params.fileType || params.clientId || params.projectId,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Documents</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload files or link external documents for clients and projects — contracts,
            proposals, logos, briefs, and more.
          </p>
        </div>
        <Link href="/dashboard/documents/new">
          <Button>
            <Plus className="h-4 w-4" />
            New document
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader
          title="All documents"
          description={`${documents.length} document${documents.length === 1 ? "" : "s"}`}
        />
        <CardBody className="space-y-4">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-100" />}>
            <DocumentSearch defaultValue={params.q ?? ""} />
          </Suspense>
          <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-slate-100" />}>
            <DocumentFilters
              currentFileType={params.fileType}
              currentClientId={params.clientId}
              currentProjectId={params.projectId}
              clients={clients}
              projects={projects}
            />
          </Suspense>

          {documents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No documents found</p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try adjusting your search or filters."
                  : "Add your first document for a client or project."}
              </p>
              {!hasFilters ? (
                <Link href="/dashboard/documents/new" className="mt-4 inline-block">
                  <Button size="sm">Add document</Button>
                </Link>
              ) : null}
            </div>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Client</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Attachment
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/dashboard/documents/${doc.id}`}
                          className="hover:underline"
                        >
                          {doc.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <DocumentFileTypeBadge fileType={doc.fileType} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {doc.client ? (
                          <Link
                            href={`/dashboard/clients/${doc.client.id}`}
                            className="hover:underline"
                          >
                            {doc.client.name}
                          </Link>
                        ) : doc.project?.client ? (
                          <Link
                            href={`/dashboard/clients/${doc.project.client.id}`}
                            className="hover:underline"
                          >
                            {doc.project.client.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {doc.project ? (
                          <Link
                            href={`/dashboard/projects/${doc.project.id}`}
                            className="hover:underline"
                          >
                            {doc.project.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <DocumentAttachmentButton
                          documentId={doc.id}
                          sourceType={doc.sourceType}
                          url={doc.url}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/documents/${doc.id}/edit`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          Edit
                        </Link>
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
