import Link from "next/link";
import { createClientAction } from "@/actions/client-mutations";
import { getPackagesForClientForm } from "@/actions/clients";
import { ClientForm } from "@/components/clients/client-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "New client",
};

export default async function NewClientPage() {
  const packages = await getPackagesForClientForm();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/clients"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to clients
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">New client</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add an active OIS client and assign their service package.
        </p>
      </div>

      <Card>
        <CardHeader title="Client details" />
        <CardBody>
          <ClientForm
            mode="create"
            action={createClientAction}
            packages={packages}
          />
        </CardBody>
      </Card>
    </div>
  );
}
