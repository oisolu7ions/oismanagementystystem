import type { InvoiceListSummary } from "@/actions/invoices";
import { formatInvoiceAmountTotal } from "@/lib/invoices/amount";
import { Card, CardBody } from "@/components/ui/card";

export function InvoiceSummaryMetrics({ summary }: { summary: InvoiceListSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Card>
        <CardBody>
          <p className="text-sm text-slate-500">Unpaid invoices</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {summary.unpaidCount}
          </p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <p className="text-sm text-slate-500">Overdue invoices</p>
          <p className="mt-1 text-2xl font-semibold text-amber-800">
            {summary.overdueCount}
          </p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <p className="text-sm text-slate-500">Paid invoices</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">
            {summary.paidCount}
          </p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <p className="text-sm text-slate-500">Total unpaid amount</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {summary.totalUnpaidAmount === null
              ? "—"
              : formatInvoiceAmountTotal(summary.totalUnpaidAmount)}
          </p>
          {summary.unparsedAmountCount > 0 ? (
            <p className="mt-1 text-xs text-slate-500">
              Some amounts could not be parsed
            </p>
          ) : null}
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <p className="text-sm text-slate-500">Total overdue amount</p>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {summary.totalOverdueAmount === null
              ? "—"
              : formatInvoiceAmountTotal(summary.totalOverdueAmount)}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
