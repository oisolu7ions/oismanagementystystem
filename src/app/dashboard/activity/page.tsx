import { getAllActivity } from "@/actions/activity";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "Activity",
};

export default async function ActivityPage() {
  const activities = await getAllActivity(100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Activity timeline
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Unified internal history across leads, clients, projects, tasks,
          invoices, follow-ups, notes, and documents.
        </p>
      </div>

      <Card>
        <CardHeader
          title="All activity"
          description={`${activities.length} recent event${activities.length === 1 ? "" : "s"}`}
        />
        <CardBody>
          <ActivityTimeline
            activities={activities}
            emptyMessage="No activity recorded yet. Actions across Command Center will appear here automatically."
          />
        </CardBody>
      </Card>
    </div>
  );
}
