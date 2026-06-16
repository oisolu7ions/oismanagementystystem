"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { generateAllDueRecurringReceiptsAction } from "@/actions/receipt-mutations";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function RecurringReceiptsBatchActions({
  dueCount,
  dueInvoices,
}: {
  dueCount: number;
  dueInvoices: { invoiceId: string; invoiceNumber: string; periodLabel: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (dueCount === 0) {
    return null;
  }

  function generateAll() {
    startTransition(async () => {
      const result = await generateAllDueRecurringReceiptsAction();
      if (result.error) {
        alert(result.error);
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader
        title="Recurring receipts due"
        description={`${dueCount} recurring invoice${dueCount === 1 ? "" : "s"} need a receipt for the current billing period`}
      />
      <CardBody className="space-y-4">
        <ul className="space-y-1 text-sm text-slate-600">
          {dueInvoices.slice(0, 5).map((item) => (
            <li key={item.invoiceId}>
              <span className="font-medium text-slate-800">{item.invoiceNumber}</span>
              {" — "}
              {item.periodLabel}
            </li>
          ))}
          {dueInvoices.length > 5 ? (
            <li className="text-slate-500">
              +{dueInvoices.length - 5} more
            </li>
          ) : null}
        </ul>
        <Button type="button" size="sm" disabled={pending} onClick={generateAll}>
          {pending ? "Generating…" : "Generate all due receipts"}
        </Button>
      </CardBody>
    </Card>
  );
}
