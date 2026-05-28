import Link from "next/link";
import type { InvoiceListSummary } from "@/actions/invoices";
import { formatInvoiceAmountTotal } from "@/lib/invoices/amount";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function InvoiceSnapshotCard({
  snapshot,
}: {
  snapshot: InvoiceListSummary;
}) {
  const unpaidAmount =
    snapshot.totalUnpaidAmount === null
      ? "—"
      : formatInvoiceAmountTotal(snapshot.totalUnpaidAmount);
  const overdueAmount =
    snapshot.totalOverdueAmount === null
      ? "—"
      : formatInvoiceAmountTotal(snapshot.totalOverdueAmount);

  return (
    <Card>
      <CardHeader
        title="Invoice snapshot"
        description="Unpaid, overdue, and paid billing at a glance."
      />
      <CardBody className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-600">Unpaid</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {snapshot.unpaidCount}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900">Overdue</p>
            <p className="mt-1 text-2xl font-semibold text-amber-950">
              {snapshot.overdueCount}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm text-emerald-900">Paid</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-950">
              {snapshot.paidCount}
            </p>
          </div>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Total unpaid amount</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{unpaidAmount}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Total overdue amount</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{overdueAmount}</dd>
          </div>
        </dl>
        {snapshot.unparsedAmountCount > 0 ? (
          <p className="text-xs text-slate-500">
            {snapshot.unparsedAmountCount} invoice
            {snapshot.unparsedAmountCount === 1 ? "" : "s"} with amounts that could
            not be parsed for totals.
          </p>
        ) : null}
        <Link
          href="/dashboard/invoices"
          className="inline-block text-sm font-medium text-slate-700 hover:underline"
        >
          View all invoices →
        </Link>
      </CardBody>
    </Card>
  );
}
