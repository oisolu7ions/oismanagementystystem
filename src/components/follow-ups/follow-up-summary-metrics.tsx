import type { FollowUpListSummary } from "@/actions/follow-ups";
import { Card, CardBody } from "@/components/ui/card";

export function FollowUpSummaryMetrics({ summary }: { summary: FollowUpListSummary }) {
  const items = [
    { label: "Pending", value: summary.pending, className: "text-slate-900" },
    { label: "Due today", value: summary.dueToday, className: "text-blue-800" },
    { label: "Overdue", value: summary.overdue, className: "text-amber-800" },
    { label: "Upcoming", value: summary.upcoming, className: "text-slate-800" },
    { label: "Completed", value: summary.completed, className: "text-emerald-700" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardBody>
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${item.className}`}>
              {item.value}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
