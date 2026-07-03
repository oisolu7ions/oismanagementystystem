import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { ClientInvoiceReceiptsSection } from "@/components/invoices/client-invoice-receipts-section";
import {
  getClientPortalInvoiceById,
  getClientPortalReceiptsByInvoiceId,
} from "@/lib/client-portal/queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { formatInvoiceDate } from "@/lib/invoices/constants";
import { InvoicePaymentLink } from "@/components/invoices/invoice-payment-link";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type ClientInvoicePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ClientInvoicePageProps) {
  const { id } = await params;
  const session = await requireClientPortalSession();
  const invoice = await getClientPortalInvoiceById(session.clientId, id);
  return { title: invoice?.invoiceNumber ?? "Invoice" };
}

export default async function ClientInvoiceDetailPage({ params }: ClientInvoicePageProps) {
  const { id } = await params;
  const session = await requireClientPortalSession();
  const [invoice, receipts] = await Promise.all([
    getClientPortalInvoiceById(session.clientId, id),
    getClientPortalReceiptsByInvoiceId(session.clientId, id),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref="/client/invoices" />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            {invoice.invoiceNumber}
          </h1>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <p className="mt-1 text-lg font-medium text-slate-700">{invoice.amount}</p>
      </div>

      <Card>
        <CardHeader title="Invoice details" />
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Due date
            </p>
            <p className="mt-1 text-slate-900">{formatInvoiceDate(invoice.dueDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Project
            </p>
            <p className="mt-1 text-slate-900">
              {invoice.project ? (
                <Link
                  href={`/client/projects/${invoice.project.id}`}
                  className="font-medium hover:underline"
                >
                  {invoice.project.name}
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>
          {invoice.clientNote ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Note
              </p>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">{invoice.clientNote}</p>
            </div>
          ) : null}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Payment link
            </p>
            <div className="mt-1">
              <InvoicePaymentLink paymentLink={invoice.paymentLink} />
            </div>
          </div>
        </CardBody>
      </Card>

      <ClientInvoiceReceiptsSection receipts={receipts} />
    </div>
  );
}
