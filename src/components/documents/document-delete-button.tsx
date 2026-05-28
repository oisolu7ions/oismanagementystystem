"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteDocumentAction } from "@/actions/document-mutations";
import { Button } from "@/components/ui/button";

export function DocumentDeleteButton({
  documentId,
  documentName,
  redirectTo = "/dashboard/documents",
  size = "sm",
}: {
  documentId: string;
  documentName: string;
  redirectTo?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size={size}
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(`Delete document "${documentName}"? This cannot be undone.`)
        ) {
          return;
        }

        startTransition(async () => {
          const result = await deleteDocumentAction(documentId);
          if (result?.error) {
            alert(result.error);
            return;
          }
          if (result?.success) {
            router.push(redirectTo);
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
