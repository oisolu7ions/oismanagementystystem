import { Card, CardBody } from "@/components/ui/card";

export function UpdateRequestSummaryMetrics({
  summary,
}: {
  summary: {
    total: number;
    submitted: number;
    needsInfo: number;
    inProgress: number;
    urgent: number;
  };
}) {
  const items = [
    { label: "Total", value: summary.total },
    { label: "Submitted", value: summary.submitted },
    { label: "Needs info", value: summary.needsInfo },
    { label: "In progress", value: summary.inProgress },
    { label: "Urgent", value: summary.urgent },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardBody>
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
