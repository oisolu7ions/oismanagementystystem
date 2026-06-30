import Link from "next/link";
import { getClientPortalInvoices } from "@/lib/client-portal/queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { formatInvoiceDate, getInvoiceStatusLabel } from "@/lib/invoices/constants";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";

export const metadata = {
  title: "Invoices",
};

export default async function ClientInvoicesPage() {
  const session = await requireClientPortalSession();
  const invoices = await getClientPortalInvoices(session.clientId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Invoices</h1>
        <p className="mt-1 text-sm text-slate-500">Your billing and payment links.</p>
      </div>

      <Card>
        <CardHeader
          title="All invoices"
          description={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        />
        <CardBody>
          {invoices.length === 0 ? (
            <p className="text-sm text-slate-500">No invoices to display.</p>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Invoice</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Project</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Due</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Note</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/client/invoices/${invoice.id}`}
                          className="hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {invoice.project ? (
                          <Link
                            href={`/client/projects/${invoice.project.id}`}
                            className="hover:underline"
                          >
                            {invoice.project.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{invoice.amount}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatInvoiceDate(invoice.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {invoice.clientNote ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceStatusBadge status={invoice.status} />
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
