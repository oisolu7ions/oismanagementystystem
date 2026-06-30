import Link from "next/link";
import { getClientPortalDocuments } from "@/lib/client-portal/queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { getDocumentFileTypeLabel } from "@/lib/documents/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Documents",
};

export default async function ClientDocumentsPage() {
  const session = await requireClientPortalSession();
  const documents = await getClientPortalDocuments(session.clientId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">Shared files and links from OIS.</p>
      </div>

      <Card>
        <CardHeader
          title="All documents"
          description={`${documents.length} document${documents.length === 1 ? "" : "s"}`}
        />
        <CardBody>
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500">No documents to display.</p>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Project</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{document.name}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {getDocumentFileTypeLabel(document.fileType)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {document.clientDescription ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {document.project ? (
                          <Link
                            href={`/client/projects/${document.project.id}`}
                            className="hover:underline"
                          >
                            {document.project.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {document.sourceType === "LINK" && document.url ? (
                          <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
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
                        ) : (
                          "—"
                        )}
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
