"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateInvoiceStatusAction } from "@/actions/invoice-mutations";
import { invoiceDateToInputValue } from "@/lib/invoices/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InvoiceMarkPaidForm({
  invoiceId,
  onCancel,
}: {
  invoiceId: string;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [paidDate, setPaidDate] = useState(invoiceDateToInputValue(new Date()));
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await updateInvoiceStatusAction(invoiceId, "PAID", paidDate);
      if (result.error) {
        setError(result.error);
        return;
      }
      onCancel?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
      <div>
        <p className="text-sm font-medium text-slate-900">Mark as paid</p>
        <p className="mt-0.5 text-xs text-slate-600">
          Choose the payment date used on the invoice and PDF receipt.
        </p>
      </div>
      <Input
        label="Payment date"
        name="paidAt"
        type="date"
        value={paidDate}
        onChange={(event) => setPaidDate(event.target.value)}
        required
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={pending || !paidDate} onClick={submit}>
          {pending ? "Saving…" : "Mark as paid & generate receipt"}
        </Button>
        {onCancel ? (
          <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}
