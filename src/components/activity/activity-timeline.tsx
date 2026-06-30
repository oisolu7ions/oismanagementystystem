import Link from "next/link";
import type { ActivityRecord } from "@/actions/activity";
import { ActivityTypeBadge } from "@/components/activity/activity-type-badge";
import { getActivityRelatedLinks } from "@/lib/activity/related-links";
import { Clock } from "lucide-react";

export function ActivityTimeline({
  activities,
  emptyMessage = "No activity recorded yet.",
  showRelatedLinks = true,
}: {
  activities: ActivityRecord[];
  emptyMessage?: string;
  showRelatedLinks?: boolean;
}) {
  if (activities.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <ol className="space-y-4">
      {activities.map((activity) => {
        const relatedLinks = showRelatedLinks
          ? getActivityRelatedLinks(activity)
          : [];

        return (
          <li
            key={activity.id}
            className="relative border-l-2 border-slate-200 pl-4 pb-1 last:pb-0"
          >
            <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-300" />
            <div className="flex flex-wrap items-center gap-2">
              <ActivityTypeBadge type={activity.type} />
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                {activity.createdAt.toLocaleString()}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-800">{activity.message}</p>
            {relatedLinks.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
