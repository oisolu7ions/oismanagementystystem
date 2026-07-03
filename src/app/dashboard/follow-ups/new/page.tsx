import { BackLink } from "@/components/layout/back-link";
import { createFollowUpAction } from "@/actions/follow-up-mutations";
import {
  getClientsForFollowUpForm,
  getLeadsForFollowUpForm,
} from "@/actions/follow-ups";
import { FollowUpForm } from "@/components/follow-ups/follow-up-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type NewFollowUpPageProps = {
  searchParams: Promise<{ leadId?: string; clientId?: string }>;
};

export const metadata = {
  title: "New follow-up",
};

export default async function NewFollowUpPage({ searchParams }: NewFollowUpPageProps) {
  const { leadId, clientId } = await searchParams;
  const [leads, clients] = await Promise.all([
    getLeadsForFollowUpForm(),
    getClientsForFollowUpForm(),
  ]);

  const backHref = leadId
    ? `/dashboard/leads/${leadId}`
    : clientId
      ? `/dashboard/clients/${clientId}`
      : "/dashboard/follow-ups";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref={backHref} />
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">New follow-up</h2>
        <p className="mt-1 text-sm text-slate-500">
          Schedule a manual reminder for a lead or client.
        </p>
      </div>

      <Card>
        <CardHeader title="Follow-up details" />
        <CardBody>
          <FollowUpForm
            mode="create"
            action={createFollowUpAction}
            leads={leads}
            clients={clients}
            initialValues={{
              leadId: leadId ?? undefined,
              clientId: clientId ?? undefined,
              status: "PENDING",
              reason: "OTHER",
            }}
            lockLeadId={Boolean(leadId)}
            lockClientId={Boolean(clientId)}
          />
        </CardBody>
      </Card>
    </div>
  );
}
