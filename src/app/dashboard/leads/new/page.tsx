import { BackLink } from "@/components/layout/back-link";
import { LeadForm } from "@/components/leads/lead-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "New lead",
};

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref="/dashboard/leads" />
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">New lead</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add a potential client to your pipeline.
        </p>
      </div>

      <Card>
        <CardHeader title="Lead details" />
        <CardBody>
          <LeadForm mode="create" />
        </CardBody>
      </Card>
    </div>
  );
}
