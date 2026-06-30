import type { UpdateRequestAttachment } from "@/generated/prisma/client";
import { getAdminUpdateRequestAttachmentFileUrl, getClientUpdateRequestAttachmentFileUrl } from "@/lib/client-portal/update-request-queries";
import { Button } from "@/components/ui/button";

export function UpdateRequestAttachmentsList({
  updateRequestId,
  attachments,
  mode,
}: {
  updateRequestId: string;
  attachments: UpdateRequestAttachment[];
  mode: "admin" | "client";
}) {
  if (attachments.length === 0) {
    return <p className="text-sm text-slate-500">No attachments yet.</p>;
  }

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => {
        const href = attachment.externalUrl
          ? attachment.externalUrl
          : attachment.storedFileName
            ? mode === "client"
              ? getClientUpdateRequestAttachmentFileUrl(updateRequestId, attachment.id)
              : getAdminUpdateRequestAttachmentFileUrl(updateRequestId, attachment.id)
            : attachment.fileUrl;

        return (
          <div
            key={attachment.id}
            className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">
                {attachment.fileName ?? "Attachment"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {attachment.externalUrl ? "External link" : attachment.fileType ?? "File"}
                {attachment.fileSize ? ` · ${Math.round(attachment.fileSize / 1024)} KB` : ""}
              </p>
              {attachment.notes ? (
                <p className="mt-1 text-sm text-slate-600">{attachment.notes}</p>
              ) : null}
            </div>
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Button type="button" size="sm" variant="secondary">
                  Open
                </Button>
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
