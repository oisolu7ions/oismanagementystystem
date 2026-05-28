import Link from "next/link";
import { LeadForm } from "@/components/leads/lead-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "New lead",
};

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/leads"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to leads
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">New lead</h2>
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
