import { getReceiptFileUrl } from "@/actions/receipts";
import { formatBillingPeriodLabel } from "@/lib/receipts/billing-period";
import type { InvoiceRecurrenceInterval } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FileText } from "lucide-react";

type InvoiceReceipt = {
  id: string;
  receiptNumber: string;
  amount: string;
  paidAt: Date;
  billingPeriod: string | null;
  createdAt: Date;
};

export function InvoiceReceiptsSection({
  receipts,
  isRecurring = false,
  recurrenceInterval = null,
}: {
  receipts: InvoiceReceipt[];
  isRecurring?: boolean;
  recurrenceInterval?: InvoiceRecurrenceInterval | null;
}) {
  const emptyMessage = isRecurring
    ? "No receipts yet. Use the button above to generate a receipt for the current billing period."
    : "No receipts yet. Mark the invoice as paid to generate a PDF receipt.";

  if (receipts.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Receipts"
          description={
            isRecurring
              ? "Generate one receipt per billing period for this recurring invoice."
              : "Receipts are generated automatically when this invoice is marked as paid."
          }
        />
        <CardBody>
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Receipts"
        description={`${receipts.length} receipt${receipts.length === 1 ? "" : "s"} generated`}
      />
      <CardBody className="space-y-3">
        {receipts.map((receipt) => {
          const periodLabel =
            receipt.billingPeriod && recurrenceInterval
              ? formatBillingPeriodLabel(
                  receipt.billingPeriod,
                  recurrenceInterval,
                )
              : null;

          return (
            <div
              key={receipt.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                  <p className="font-medium text-slate-900">{receipt.receiptNumber}</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {receipt.amount}
                  {periodLabel ? ` · ${periodLabel}` : ""}
                  {" · Paid "}
                  {receipt.paidAt.toLocaleString()}
                </p>
              </div>
              <a href={getReceiptFileUrl(receipt.id)} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="secondary" size="sm">
                  Download receipt
                </Button>
              </a>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
