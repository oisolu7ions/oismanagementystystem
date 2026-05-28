import Link from "next/link";
import type { DocumentFileType } from "@/generated/prisma/client";
import { DocumentDeleteButton } from "@/components/documents/document-delete-button";
import { DocumentFileTypeBadge } from "@/components/documents/document-file-type-badge";
import { DocumentOpenLinkButton } from "@/components/documents/document-open-link-button";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";

type ClientDocument = {
  id: string;
  name: string;
  fileType: DocumentFileType;
  url: string;
  notes: string | null;
  createdAt: Date;
  project: { id: string; name: string } | null;
};

export function ClientDocumentsSection({
  clientId,
  documents,
}: {
  clientId: string;
  documents: ClientDocument[];
}) {
  return (
    <Card>
      <CardHeader
        title="Documents"
        description={`${documents.length} document link${documents.length === 1 ? "" : "s"}`}
        action={
          <Link href={`/dashboard/documents/new?clientId=${clientId}`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New document
            </Button>
          </Link>
        }
      />
      <CardBody>
        {documents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No documents yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Attach contracts, proposals, branding folders, and other client file links.
            </p>
            <Link
              href={`/dashboard/documents/new?clientId=${clientId}`}
              className="mt-4 inline-block"
            >
              <Button size="sm">Add document link</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Notes</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Added
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
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                      {doc.notes ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {doc.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <DocumentOpenLinkButton url={doc.url} />
                        <Link href={`/dashboard/documents/${doc.id}/edit`}>
                          <Button type="button" variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <DocumentDeleteButton
                          documentId={doc.id}
                          documentName={doc.name}
                          redirectTo={`/dashboard/clients/${clientId}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
