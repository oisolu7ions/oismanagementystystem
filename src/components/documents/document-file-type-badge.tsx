import {
  getDocumentFileTypeLabel,
  type DocumentFileTypeValue,
} from "@/lib/documents/constants";
import { Badge } from "@/components/ui/badge";

const typeVariants: Record<
  DocumentFileTypeValue,
  "default" | "success" | "warning" | "info" | "muted"
> = {
  CONTRACT: "info",
  PROPOSAL: "info",
  INVOICE: "default",
  LOGO: "muted",
  BRANDING: "muted",
  IMAGES: "muted",
  WEBSITE_COPY: "default",
  ACCESS_CREDENTIALS: "warning",
  MEETING_NOTES: "default",
  PROJECT_BRIEF: "info",
  LEGAL_DOCUMENT: "warning",
  OTHER: "muted",
};

export function DocumentFileTypeBadge({ fileType }: { fileType: DocumentFileTypeValue }) {
  return (
    <Badge variant={typeVariants[fileType]}>{getDocumentFileTypeLabel(fileType)}</Badge>
  );
}
