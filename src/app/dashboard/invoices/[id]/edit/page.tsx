import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
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
        <BackLink fallbackHref={`/dashboard/invoices/${invoice.id}`} />
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
              isRecurring: invoice.isRecurring,
              recurrenceInterval: invoice.recurrenceInterval ?? undefined,
              clientVisible: invoice.clientVisible,
              clientNote: invoice.clientNote ?? undefined,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
