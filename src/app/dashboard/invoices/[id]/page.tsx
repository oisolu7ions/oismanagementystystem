import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoiceById } from "@/actions/invoices";
import { InvoiceDeleteButton } from "@/components/invoices/invoice-delete-button";
import { InvoiceDueDate } from "@/components/invoices/invoice-due-date";
import { InvoicePaymentLink } from "@/components/invoices/invoice-payment-link";
import { InvoiceQuickStatusSelect } from "@/components/invoices/invoice-quick-status-select";
import { InvoiceStatusActions } from "@/components/invoices/invoice-status-actions";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  return { title: invoice?.invoiceNumber ?? "Invoice" };
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/invoices"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to invoices
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              {invoice.invoiceNumber}
            </h2>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="mt-1 text-lg font-medium text-slate-700">{invoice.amount}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <InvoiceDeleteButton
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoiceNumber}
          />
        </div>
      </div>

      <Card>
        <CardHeader title="Quick actions" />
        <CardBody className="space-y-4">
          <InvoiceStatusActions
            invoiceId={invoice.id}
            currentStatus={invoice.status}
          />
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              Status dropdown
            </p>
            <InvoiceQuickStatusSelect
              invoiceId={invoice.id}
              currentStatus={invoice.status}
            />
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Client" />
          <CardBody className="text-sm">
            <Link
              href={`/dashboard/clients/${invoice.client.id}`}
              className="font-medium text-slate-900 hover:underline"
            >
              {invoice.client.name}
            </Link>
            {invoice.client.businessName ? (
              <p className="mt-1 text-slate-600">{invoice.client.businessName}</p>
            ) : null}
            {invoice.client.email ? (
              <p className="mt-1 text-slate-600">{invoice.client.email}</p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Project" />
          <CardBody className="text-sm">
            {invoice.project ? (
              <Link
                href={`/dashboard/projects/${invoice.project.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {invoice.project.name}
              </Link>
            ) : (
              <p className="text-slate-600">No project linked</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Billing" />
        <CardBody className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Amount
            </p>
            <p className="mt-1 text-slate-900">{invoice.amount}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Due date
            </p>
            <p className="mt-1">
              <InvoiceDueDate dueDate={invoice.dueDate} status={invoice.status} />
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Payment link
            </p>
            <div className="mt-1">
              <InvoicePaymentLink paymentLink={invoice.paymentLink} />
            </div>
          </div>
          {invoice.paidAt ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Marked paid
              </p>
              <p className="mt-1 text-slate-900">{invoice.paidAt.toLocaleString()}</p>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {invoice.notes ? (
        <Card>
          <CardHeader title="Notes" />
          <CardBody>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {invoice.notes}
            </p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Record" />
        <CardBody className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-medium text-slate-700">Created:</span>{" "}
            {invoice.createdAt.toLocaleString()}
          </p>
          <p>
            <span className="font-medium text-slate-700">Updated:</span>{" "}
            {invoice.updatedAt.toLocaleString()}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
