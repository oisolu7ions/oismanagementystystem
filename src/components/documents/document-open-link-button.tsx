import { normalizeDocumentUrl } from "@/lib/documents/constants";
import { Button } from "@/components/ui/button";

export function DocumentOpenLinkButton({
  url,
  size = "sm",
  label = "Open link",
}: {
  url: string;
  size?: "sm" | "md";
  label?: string;
}) {
  const href = normalizeDocumentUrl(url);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Button type="button" variant="secondary" size={size}>
        {label}
      </Button>
    </a>
  );
}
