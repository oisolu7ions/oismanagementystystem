"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { generateRecurringReceiptAction } from "@/actions/receipt-mutations";
import { Button } from "@/components/ui/button";

export function InvoiceRecurringReceiptActions({
  invoiceId,
  currentPeriodLabel,
  hasCurrentPeriodReceipt,
}: {
  invoiceId: string;
  currentPeriodLabel: string;
  hasCurrentPeriodReceipt: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function generateReceipt() {
    startTransition(async () => {
      const result = await generateRecurringReceiptAction(invoiceId);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (hasCurrentPeriodReceipt) {
    return (
      <p className="text-sm text-emerald-700">
        Receipt already generated for {currentPeriodLabel}. See the receipts
        section below.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button type="button" size="sm" disabled={pending} onClick={generateReceipt}>
        {pending
          ? "Generating…"
          : `Generate receipt for ${currentPeriodLabel}`}
      </Button>
      <p className="text-xs text-slate-500">
        Creates a PDF receipt for this billing period without changing invoice
        status.
      </p>
    </div>
  );
}
