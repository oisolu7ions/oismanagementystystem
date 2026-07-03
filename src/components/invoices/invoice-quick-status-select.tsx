"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateInvoiceStatusAction } from "@/actions/invoice-mutations";
import type { InvoiceStatus } from "@/generated/prisma/client";
import {
  invoiceStatusOptions,
  type InvoiceStatusValue,
} from "@/lib/invoices/constants";
import { InvoiceMarkPaidForm } from "@/components/invoices/invoice-mark-paid-form";

export function InvoiceQuickStatusSelect({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: InvoiceStatusValue;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [displayStatus, setDisplayStatus] = useState(currentStatus);
  const [showMarkPaidForm, setShowMarkPaidForm] = useState(false);

  useEffect(() => {
    setDisplayStatus(currentStatus);
    setShowMarkPaidForm(false);
  }, [currentStatus]);

  const selectClass =
    "block w-full min-w-[8.5rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60";

  function updateStatus(status: InvoiceStatus) {
    startTransition(async () => {
      const result = await updateInvoiceStatusAction(invoiceId, status);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <select
        aria-label="Update invoice status"
        value={displayStatus}
        disabled={pending || showMarkPaidForm}
        className={selectClass}
        onChange={(event) => {
          const status = event.target.value as InvoiceStatus;
          if (status === "PAID" && currentStatus !== "PAID") {
            setShowMarkPaidForm(true);
            setDisplayStatus(currentStatus);
            return;
          }
          setDisplayStatus(status);
          updateStatus(status);
        }}
      >
        {invoiceStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showMarkPaidForm ? (
        <InvoiceMarkPaidForm
          invoiceId={invoiceId}
          onCancel={() => setShowMarkPaidForm(false)}
        />
      ) : null}
    </div>
  );
}
