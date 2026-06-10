import Link from "next/link";
import { notFound } from "next/navigation";
import { updateInvoiceAction } from "@/actions/invoice-mutations";
import {
  getClientsForInvoiceForm,
  getInvoiceById,
  getProjectsForInvoiceForm,
} from "@/actions/invoices";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { invoiceDateToInputValue } from "@/lib/invoices/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type EditInvoicePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditInvoicePageProps) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  return { title: invoice ? `Edit ${invoice.invoiceNumber}` : "Edit invoice" };
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const [clients, projects] = await Promise.all([
    getClientsForInvoiceForm(),
    getProjectsForInvoiceForm(invoice.clientId),
  ]);

  const boundUpdate = updateInvoiceAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/dashboard/invoices/${invoice.id}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to invoice
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          Edit {invoice.invoiceNumber}
        </h2>
      </div>

      <Card>
        <CardHeader title="Invoice details" />
        <CardBody>
          <InvoiceForm
            mode="edit"
            action={boundUpdate}
            clients={clients}
            projects={projects}
            initialValues={{
              invoiceNumber: invoice.invoiceNumber,
              clientId: invoice.clientId,
              projectId: invoice.projectId ?? undefined,
              amount: invoice.amount,
              status: invoice.status,
              dueDate: invoiceDateToInputValue(invoice.dueDate),
              paymentLink: invoice.paymentLink ?? undefined,
              notes: invoice.notes ?? undefined,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
