import {
  formatFollowUpDate,
  isFollowUpDueToday,
  isFollowUpOverdue,
  type FollowUpStatusValue,
} from "@/lib/follow-ups/constants";
import { FollowUpOverdueBadge } from "@/components/follow-ups/follow-up-overdue-badge";
import { Badge } from "@/components/ui/badge";

export function FollowUpDueDate({
  followUpDate,
  status,
}: {
  followUpDate: Date;
  status: FollowUpStatusValue | string;
}) {
  const overdue = isFollowUpOverdue(followUpDate, status);
  const dueToday = isFollowUpDueToday(followUpDate, status);

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span
        className={
          overdue
            ? "font-medium text-amber-800"
            : dueToday
              ? "font-medium text-blue-800"
              : undefined
        }
      >
        {formatFollowUpDate(followUpDate)}
      </span>
      {overdue ? <FollowUpOverdueBadge /> : null}
      {dueToday && !overdue ? <Badge variant="info">Due today</Badge> : null}
    </span>
  );
}
