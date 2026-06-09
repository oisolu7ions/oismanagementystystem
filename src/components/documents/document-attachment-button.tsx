import type { DocumentSourceType } from "@/generated/prisma/client";
import { getDocumentFileUrl } from "@/lib/documents/constants";
import { DocumentOpenLinkButton } from "@/components/documents/document-open-link-button";
import { Button } from "@/components/ui/button";

type DocumentAttachmentButtonProps = {
  documentId: string;
  sourceType: DocumentSourceType;
  url?: string | null;
  size?: "sm" | "md";
};

export function DocumentAttachmentButton({
  documentId,
  sourceType,
  url,
  size = "sm",
}: DocumentAttachmentButtonProps) {
  if (sourceType === "FILE") {
    return (
      <a href={getDocumentFileUrl(documentId)} target="_blank" rel="noopener noreferrer">
        <Button type="button" variant="secondary" size={size}>
          Open file
        </Button>
      </a>
    );
  }

  if (!url) {
    return <span className="text-sm text-slate-400">No link</span>;
  }

  return <DocumentOpenLinkButton url={url} size={size} />;
}
