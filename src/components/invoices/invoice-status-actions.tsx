"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  forceMarkInvoiceOverdueAction,
  updateInvoiceStatusAction,
} from "@/actions/invoice-mutations";
import type { InvoiceStatusValue } from "@/lib/invoices/constants";
import { Button } from "@/components/ui/button";

export function InvoiceStatusActions({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: InvoiceStatusValue;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setStatus(status: "SENT" | "PAID" | "CANCELLED" | "OVERDUE") {
    startTransition(async () => {
      const result =
        status === "OVERDUE"
          ? await forceMarkInvoiceOverdueAction(invoiceId)
          : await updateInvoiceStatusAction(invoiceId, status);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  const isFinal = currentStatus === "PAID" || currentStatus === "CANCELLED";

  return (
    <div className="flex flex-wrap gap-2">
      {currentStatus !== "SENT" && !isFinal ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => setStatus("SENT")}
        >
          Mark as Sent
        </Button>
      ) : null}
      {currentStatus !== "PAID" && currentStatus !== "CANCELLED" ? (
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => setStatus("PAID")}
        >
          Mark as Paid
        </Button>
      ) : null}
      {currentStatus !== "OVERDUE" && !isFinal ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => setStatus("OVERDUE")}
        >
          Mark as Overdue
        </Button>
      ) : null}
      {currentStatus !== "CANCELLED" && currentStatus !== "PAID" ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (!window.confirm("Cancel this invoice?")) return;
            setStatus("CANCELLED");
          }}
        >
          Mark as Cancelled
        </Button>
      ) : null}
    </div>
  );
}
