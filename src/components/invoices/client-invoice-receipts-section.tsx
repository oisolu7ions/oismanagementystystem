import { getClientReceiptFileUrl } from "@/actions/receipts";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FileText } from "lucide-react";

type ClientInvoiceReceipt = {
  id: string;
  receiptNumber: string;
  amount: string;
  paidAt: Date;
};

export function ClientInvoiceReceiptsSection({
  receipts,
}: {
  receipts: ClientInvoiceReceipt[];
}) {
  if (receipts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        title="Receipts"
        description={`${receipts.length} receipt${receipts.length === 1 ? "" : "s"} available`}
      />
      <CardBody className="space-y-3">
        {receipts.map((receipt) => (
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
                {" · Paid "}
                {receipt.paidAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <a
              href={getClientReceiptFileUrl(receipt.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button type="button" variant="secondary" size="sm">
                Download receipt
              </Button>
            </a>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
