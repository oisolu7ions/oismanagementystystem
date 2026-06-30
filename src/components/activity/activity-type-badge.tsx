import type { ActivityType } from "@/generated/prisma/client";
import {
  getActivityTypeLabel,
  getActivityTypeVariant,
} from "@/lib/activity/constants";
import { Badge } from "@/components/ui/badge";

export function ActivityTypeBadge({ type }: { type: ActivityType | string }) {
  return (
    <Badge variant={getActivityTypeVariant(type)}>
      {getActivityTypeLabel(type)}
    </Badge>
  );
}
