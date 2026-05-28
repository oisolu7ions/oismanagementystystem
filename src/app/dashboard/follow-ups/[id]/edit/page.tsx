import Link from "next/link";
import { notFound } from "next/navigation";
import { updateFollowUpAction } from "@/actions/follow-up-mutations";
import {
  getClientsForFollowUpForm,
  getFollowUpById,
  getLeadsForFollowUpForm,
} from "@/actions/follow-ups";
import { FollowUpForm } from "@/components/follow-ups/follow-up-form";
import {
  followUpDateToInputValue,
  getFollowUpReasonLabel,
} from "@/lib/follow-ups/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type EditFollowUpPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditFollowUpPageProps) {
  const { id } = await params;
  const followUp = await getFollowUpById(id);
  return {
    title: followUp
      ? `Edit ${getFollowUpReasonLabel(followUp.reason)}`
      : "Edit follow-up",
  };
}

export default async function EditFollowUpPage({ params }: EditFollowUpPageProps) {
  const { id } = await params;
  const followUp = await getFollowUpById(id);

  if (!followUp) {
    notFound();
  }

  const [leads, clients] = await Promise.all([
    getLeadsForFollowUpForm(),
    getClientsForFollowUpForm(),
  ]);

  const boundUpdate = updateFollowUpAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/dashboard/follow-ups/${followUp.id}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to follow-up
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Edit {getFollowUpReasonLabel(followUp.reason)}
        </h2>
      </div>

      <Card>
        <CardHeader title="Follow-up details" />
        <CardBody>
          <FollowUpForm
            mode="edit"
            action={boundUpdate}
            leads={leads}
            clients={clients}
            initialValues={{
              reason: followUp.reason,
              followUpDate: followUpDateToInputValue(followUp.followUpDate),
              status: followUp.status,
              notes: followUp.notes ?? undefined,
              leadId: followUp.leadId ?? undefined,
              clientId: followUp.clientId ?? undefined,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
