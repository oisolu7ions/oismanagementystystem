import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById } from "@/actions/leads";
import { LeadForm } from "@/components/leads/lead-form";
import { followUpDateToInputValue } from "@/lib/leads/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type EditLeadPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditLeadPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);
  return { title: lead ? `Edit ${lead.name}` : "Edit lead" };
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to lead
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          Edit {lead.name}
        </h2>
      </div>

      <Card>
        <CardHeader title="Lead details" />
        <CardBody>
          <LeadForm
            mode="edit"
            leadId={lead.id}
            initialValues={{
              name: lead.name,
              businessName: lead.businessName ?? undefined,
              email: lead.email ?? undefined,
              phone: lead.phone ?? undefined,
              website: lead.website ?? undefined,
              industry: lead.industry ?? undefined,
              serviceInterest: lead.serviceInterest ?? undefined,
              leadSource: lead.leadSource ?? undefined,
              status: lead.status,
              notes: lead.notes ?? undefined,
              followUpDate: followUpDateToInputValue(lead.followUpDate),
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
