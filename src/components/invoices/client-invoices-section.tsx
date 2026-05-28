import Link from "next/link";
import type { InvoiceStatus } from "@/generated/prisma/client";
import { InvoiceDueDate } from "@/components/invoices/invoice-due-date";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";

type ClientInvoice = {
  id: string;
  invoiceNumber: string;
  amount: string;
  status: InvoiceStatus;
  dueDate: Date | null;
  project: { id: string; name: string } | null;
};

export function ClientInvoicesSection({
  clientId,
  invoices,
}: {
  clientId: string;
  invoices: ClientInvoice[];
}) {
  return (
    <Card>
      <CardHeader
        title="Invoices"
        description={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        action={
          <Link href={`/dashboard/invoices/new?clientId=${clientId}`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New invoice
            </Button>
          </Link>
        }
      />
      <CardBody>
        {invoices.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No invoices yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Track setup fees, monthly charges, and project payments for this client.
            </p>
            <Link
              href={`/dashboard/invoices/new?clientId=${clientId}`}
              className="mt-4 inline-block"
            >
              <Button size="sm">Create first invoice</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Invoice
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
