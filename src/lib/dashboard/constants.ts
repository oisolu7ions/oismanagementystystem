import type { ProjectStatusValue } from "@/lib/projects/constants";

export const OPEN_PROJECT_STATUSES: ProjectStatusValue[] = [
  "NOT_STARTED",
  "DISCOVERY",
  "DESIGN",
  "DEVELOPMENT",
  "REVIEW",
  "WAITING_ON_CLIENT",
];

export const PROJECT_IN_PROGRESS_STATUSES: ProjectStatusValue[] = [
  "DISCOVERY",
  "DESIGN",
  "DEVELOPMENT",
  "REVIEW",
  "WAITING_ON_CLIENT",
];

export const CLOSED_PROJECT_STATUSES: ProjectStatusValue[] = [
  "COMPLETED",
  "CANCELLED",
  "PAUSED",
];
