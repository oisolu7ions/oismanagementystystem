"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateInvoiceStatusAction } from "@/actions/invoice-mutations";
import type { InvoiceStatus } from "@/generated/prisma/client";
import {
  invoiceStatusOptions,
  type InvoiceStatusValue,
} from "@/lib/invoices/constants";

export function InvoiceQuickStatusSelect({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: InvoiceStatusValue;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const selectClass =
    "block w-full min-w-[8.5rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60";

  return (
    <select
      aria-label="Update invoice status"
      value={currentStatus}
      disabled={pending}
      className={selectClass}
      onChange={(event) => {
        const status = event.target.value as InvoiceStatus;
        startTransition(async () => {
          const result = await updateInvoiceStatusAction(invoiceId, status);
          if (result.error) {
            alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      {invoiceStatusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
