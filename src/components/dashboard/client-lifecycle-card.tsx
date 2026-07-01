import type { DashboardMetrics } from "@/lib/dashboard/metrics";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

const lifecycleSteps: {
  label: string;
  key: keyof DashboardMetrics["lifecycle"];
}[] = [
  { label: "Lead captured", key: "leadsTotal" },
  { label: "Consultation scheduled", key: "consultationScheduled" },
  { label: "Proposal sent", key: "proposalSent" },
  { label: "Client onboarded", key: "clientsActive" },
  { label: "Project created", key: "projectsTotal" },
  { label: "Tasks assigned", key: "tasksTotal" },
  { label: "Invoice tracked", key: "invoicesTotal" },
  { label: "Follow-ups managed", key: "followUpsTotal" },
  { label: "Notes attached", key: "notesTotal" },
  { label: "Documents attached", key: "documentsTotal" },
];

export function ClientLifecycleCard({
  lifecycle,
}: {
  lifecycle: DashboardMetrics["lifecycle"];
}) {
  return (
    <Card>
      <CardHeader
        title="Client lifecycle"
        description="Real counts across your OIS Management Center data."
      />
      <CardBody>
        <ol className="space-y-3">
          {lifecycleSteps.map((step, index) => (
            <li key={step.label} className="flex items-start gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                {index + 1}
              </span>
              <span className="flex flex-1 items-center justify-between gap-4 text-slate-700">
                <span>{step.label}</span>
                <span className="font-semibold tabular-nums text-slate-900">
                  {lifecycle[step.key]}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
}
