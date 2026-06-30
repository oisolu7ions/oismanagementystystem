import Link from "next/link";
import type { ActivityRecord } from "@/actions/activity";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export function RecentActivityCard({
  activities,
}: {
  activities: ActivityRecord[];
}) {
  return (
    <Card>
      <CardHeader
        title="Recent activity"
        description="Latest updates across leads, clients, projects, and billing"
        action={
          <Link
            href="/dashboard/activity"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <CardBody>
        <ActivityTimeline
          activities={activities}
          emptyMessage="Activity will appear here as your team works in Command Center."
        />
      </CardBody>
    </Card>
  );
}
