"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteInvoiceAction } from "@/actions/invoice-mutations";
import { Button } from "@/components/ui/button";

export function InvoiceDeleteButton({
  invoiceId,
  invoiceNumber,
  redirectTo = "/dashboard/invoices",
}: {
  invoiceId: string;
  invoiceNumber: string;
  redirectTo?: string;
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
            `Delete invoice "${invoiceNumber}"? This cannot be undone.`,
          )
        ) {
          return;
        }

        startTransition(async () => {
          const result = await deleteInvoiceAction(invoiceId);
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
