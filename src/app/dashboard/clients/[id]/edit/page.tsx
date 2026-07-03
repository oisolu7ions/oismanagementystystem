import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { updateClientAction } from "@/actions/client-mutations";
import { getClientById, getPackagesForClientForm } from "@/actions/clients";
import { ClientForm } from "@/components/clients/client-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type EditClientPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditClientPageProps) {
  const { id } = await params;
  const client = await getClientById(id);
  return { title: client ? `Edit ${client.name}` : "Edit client" };
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  const selectablePackages = await getPackagesForClientForm(client.packageId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref={`/dashboard/clients/${client.id}`} />
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          Edit {client.name}
        </h2>
      </div>

      <Card>
        <CardHeader title="Client details" />
        <CardBody>
          <ClientForm
            mode="edit"
            action={updateClientAction.bind(null, client.id)}
            packages={selectablePackages}
            initialValues={{
              name: client.name,
              businessName: client.businessName ?? undefined,
              email: client.email ?? undefined,
              phone: client.phone ?? undefined,
              website: client.website ?? undefined,
              address: client.address ?? undefined,
              status: client.status,
              packageId: client.packageId ?? undefined,
              monthlyPlan: client.monthlyPlan ?? undefined,
              monthlyAmount: client.monthlyAmount ?? undefined,
              notes: client.notes ?? undefined,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
