import Link from "next/link";
import { Suspense } from "react";
import {
  getClientsForInvoiceFilter,
  getInvoiceListSummary,
  getProjectsForInvoiceFilter,
  searchInvoices,
  type InvoiceSearchParams,
} from "@/actions/invoices";
import { getDueRecurringReceiptsSummary } from "@/actions/receipt-mutations";
import { InvoiceDueDate } from "@/components/invoices/invoice-due-date";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { InvoiceSearch } from "@/components/invoices/invoice-search";
import { InvoiceRecurrenceBadge } from "@/components/invoices/invoice-recurrence-badge";
import { RecurringReceiptsBatchActions } from "@/components/invoices/recurring-receipts-batch-actions";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { InvoiceSummaryMetrics } from "@/components/invoices/invoice-summary-metrics";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";

type InvoicesPageProps = {
  searchParams: Promise<InvoiceSearchParams>;
};

export const metadata = {
  title: "Invoices",
};

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const [invoices, clients, projects, summary, recurringDue] = await Promise.all([
    searchInvoices(params),
    getClientsForInvoiceFilter(),
    getProjectsForInvoiceFilter(),
    getInvoiceListSummary(params),
    getDueRecurringReceiptsSummary(),
  ]);
  const hasFilters = Boolean(
    params.q || params.status || params.clientId || params.projectId,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Invoices</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track billing, due dates, and manual payment links — no payment processing
            in-app.
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus className="h-4 w-4" />
            New invoice
          </Button>
        </Link>
      </div>

      <InvoiceSummaryMetrics summary={summary} />

      <RecurringReceiptsBatchActions
        dueCount={recurringDue.count}
        dueInvoices={recurringDue.due}
      />

      <Card>
        <CardHeader
          title="All invoices"
          description={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        />
        <CardBody className="space-y-4">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-100" />}>
            <InvoiceSearch defaultValue={params.q ?? ""} />
          </Suspense>
          <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-slate-100" />}>
            <InvoiceFilters
              currentStatus={params.status}
              currentClientId={params.clientId}
              currentProjectId={params.projectId}
              clients={clients}
              projects={projects}
            />
          </Suspense>

          {invoices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No invoices found</p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try adjusting your search or filters."
                  : "Create your first invoice for a client or project."}
              </p>
              {!hasFilters ? (
                <Link href="/dashboard/invoices/new" className="mt-4 inline-block">
                  <Button size="sm">Create invoice</Button>
                </Link>
              ) : null}
            </div>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Invoice
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Due
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                        {invoice.isRecurring ? (
                          <div className="mt-1">
                            <InvoiceRecurrenceBadge
                              isRecurring={invoice.isRecurring}
                              recurrenceInterval={invoice.recurrenceInterval}
                            />
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <Link
                          href={`/dashboard/clients/${invoice.client.id}`}
                          className="font-medium text-slate-800 hover:underline"
                        >
                          {invoice.client.name}
                        </Link>
                        {invoice.client.businessName ? (
                          <div className="text-xs text-slate-500">
                            {invoice.client.businessName}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {invoice.project ? (
                          <Link
                            href={`/dashboard/projects/${invoice.project.id}`}
                            className="hover:underline"
                          >
                            {invoice.project.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{invoice.amount}</td>
                      <td className="px-4 py-3">
                        <InvoiceDueDate
                          dueDate={invoice.dueDate}
                          status={invoice.status}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-3">
                        {invoice.paymentLink ? (
                          <span className="text-xs font-medium text-emerald-700">
                            Link set
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}/edit`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
