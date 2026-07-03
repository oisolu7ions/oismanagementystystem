"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteReceiptAction } from "@/actions/receipt-mutations";
import { Button } from "@/components/ui/button";

export function ReceiptDeleteButton({
  receiptId,
  receiptNumber,
}: {
  receiptId: string;
  receiptNumber: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(
            `Delete receipt "${receiptNumber}"? This removes the PDF for admin and client access.`,
          )
        ) {
          return;
        }

        startTransition(async () => {
          const result = await deleteReceiptAction(receiptId);
          if (result.error) {
            alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
