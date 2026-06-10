import Link from "next/link";
import { createInvoiceAction } from "@/actions/invoice-mutations";
import {
  getClientsForInvoiceForm,
  getProjectsForInvoiceForm,
  getSuggestedInvoiceNumber,
} from "@/actions/invoices";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type NewInvoicePageProps = {
  searchParams: Promise<{ clientId?: string; projectId?: string }>;
};

export const metadata = {
  title: "New invoice",
};

export default async function NewInvoicePage({ searchParams }: NewInvoicePageProps) {
  const { clientId, projectId } = await searchParams;
  const [clients, projects, suggestedInvoiceNumber] = await Promise.all([
    getClientsForInvoiceForm(),
    getProjectsForInvoiceForm(clientId),
    getSuggestedInvoiceNumber(),
  ]);

  const backHref = projectId
    ? `/dashboard/projects/${projectId}`
    : clientId
      ? `/dashboard/clients/${clientId}`
      : "/dashboard/invoices";
  const backLabel = projectId
    ? "← Back to project"
    : clientId
      ? "← Back to client"
      : "← Back to invoices";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={backHref}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          {backLabel}
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">New invoice</h2>
        <p className="mt-1 text-sm text-slate-500">
          Record an amount, due date, and optional manual payment link. Payments are
          not processed in OIS Command Center.
        </p>
      </div>

      <Card>
        <CardHeader title="Invoice details" />
        <CardBody>
          <InvoiceForm
            mode="create"
            action={createInvoiceAction}
            clients={clients}
            projects={projects}
            suggestedInvoiceNumber={suggestedInvoiceNumber}
            initialValues={{
              clientId: clientId ?? undefined,
              projectId: projectId ?? undefined,
              status: "DRAFT",
            }}
            lockClientId={Boolean(clientId)}
            lockProjectId={Boolean(projectId)}
          />
        </CardBody>
      </Card>
    </div>
  );
}
