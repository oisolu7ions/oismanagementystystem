import type {
  UpdateRequestPriority,
  UpdateRequestStatus,
  UpdateRequestType,
} from "@/generated/prisma/client";

export const UPDATE_REQUEST_TYPE_VALUES = [
  "WEBSITE_CONTENT_UPDATE",
  "WEBSITE_DESIGN_UPDATE",
  "WEBSITE_BUG_FIX",
  "NEW_WEBSITE_PAGE",
  "FORM_UPDATE",
  "SYSTEM_FEATURE_REQUEST",
  "DASHBOARD_UPDATE",
  "AUTOMATION_UPDATE",
  "CLIENT_PORTAL_UPDATE",
  "FILE_ASSET_UPDATE",
  "GENERAL_SUPPORT",
  "OTHER",
] as const satisfies readonly UpdateRequestType[];

export const UPDATE_REQUEST_PRIORITY_VALUES = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
] as const satisfies readonly UpdateRequestPriority[];

export const UPDATE_REQUEST_STATUS_VALUES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "NEEDS_MORE_INFORMATION",
  "APPROVED",
  "SCHEDULED",
  "IN_PROGRESS",
  "WAITING_ON_CLIENT",
  "COMPLETED",
  "DECLINED",
  "CANCELLED",
] as const satisfies readonly UpdateRequestStatus[];

export type UpdateRequestTypeValue = (typeof UPDATE_REQUEST_TYPE_VALUES)[number];
export type UpdateRequestPriorityValue = (typeof UPDATE_REQUEST_PRIORITY_VALUES)[number];
export type UpdateRequestStatusValue = (typeof UPDATE_REQUEST_STATUS_VALUES)[number];

export const updateRequestTypeLabels: Record<UpdateRequestTypeValue, string> = {
  WEBSITE_CONTENT_UPDATE: "Website Content Update",
  WEBSITE_DESIGN_UPDATE: "Website Design Update",
  WEBSITE_BUG_FIX: "Website Bug Fix",
  NEW_WEBSITE_PAGE: "New Website Page",
  FORM_UPDATE: "Form Update",
  SYSTEM_FEATURE_REQUEST: "System Feature Request",
  DASHBOARD_UPDATE: "Dashboard Update",
  AUTOMATION_UPDATE: "Automation Update",
  CLIENT_PORTAL_UPDATE: "Client Portal Update",
  FILE_ASSET_UPDATE: "File/Asset Update",
  GENERAL_SUPPORT: "General Support",
  OTHER: "Other",
};

export const updateRequestPriorityLabels: Record<UpdateRequestPriorityValue, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const updateRequestStatusLabels: Record<UpdateRequestStatusValue, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  NEEDS_MORE_INFORMATION: "Needs More Information",
  APPROVED: "Approved",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  WAITING_ON_CLIENT: "Waiting on Client",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

const updateRequestStatusVariants: Record<
  UpdateRequestStatusValue,
  "default" | "success" | "warning" | "info" | "muted"
> = {
  SUBMITTED: "info",
  UNDER_REVIEW: "default",
  NEEDS_MORE_INFORMATION: "warning",
  APPROVED: "info",
  SCHEDULED: "default",
  IN_PROGRESS: "info",
  WAITING_ON_CLIENT: "warning",
  COMPLETED: "success",
  DECLINED: "muted",
  CANCELLED: "muted",
};

const updateRequestPriorityVariants: Record<
  UpdateRequestPriorityValue,
  "default" | "success" | "warning" | "info" | "muted"
> = {
  LOW: "muted",
  NORMAL: "default",
  HIGH: "warning",
  URGENT: "warning",
};

export function getUpdateRequestTypeLabel(type: UpdateRequestType | string): string {
  return updateRequestTypeLabels[type as UpdateRequestTypeValue] ?? type;
}

export function getUpdateRequestPriorityLabel(
  priority: UpdateRequestPriority | string,
): string {
  return updateRequestPriorityLabels[priority as UpdateRequestPriorityValue] ?? priority;
}

export function getUpdateRequestStatusLabel(status: UpdateRequestStatus | string): string {
  return updateRequestStatusLabels[status as UpdateRequestStatusValue] ?? status;
}

export function getUpdateRequestStatusVariant(
  status: UpdateRequestStatus | string,
): "default" | "success" | "warning" | "info" | "muted" {
  return updateRequestStatusVariants[status as UpdateRequestStatusValue] ?? "default";
}

export function getUpdateRequestPriorityVariant(
  priority: UpdateRequestPriority | string,
): "default" | "success" | "warning" | "info" | "muted" {
  return updateRequestPriorityVariants[priority as UpdateRequestPriorityValue] ?? "default";
}

export const updateRequestTypeOptions = UPDATE_REQUEST_TYPE_VALUES.map((value) => ({
  value,
  label: updateRequestTypeLabels[value],
}));

export const updateRequestPriorityOptions = UPDATE_REQUEST_PRIORITY_VALUES.map((value) => ({
  value,
  label: updateRequestPriorityLabels[value],
}));

export const updateRequestStatusOptions = UPDATE_REQUEST_STATUS_VALUES.map((value) => ({
  value,
  label: updateRequestStatusLabels[value],
}));

export const CLIENT_EDITABLE_UPDATE_REQUEST_STATUSES: UpdateRequestStatusValue[] = [
  "SUBMITTED",
  "NEEDS_MORE_INFORMATION",
];

export const CLIENT_CANCELLABLE_UPDATE_REQUEST_STATUSES: UpdateRequestStatusValue[] = [
  "SUBMITTED",
  "NEEDS_MORE_INFORMATION",
];

export const ATTENTION_UPDATE_REQUEST_STATUSES: UpdateRequestStatusValue[] = [
  "SUBMITTED",
  "NEEDS_MORE_INFORMATION",
];

export const UPDATE_REQUEST_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const UPDATE_REQUEST_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/zip",
];

export function formatUpdateRequestDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function updateRequestDateToInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function mapUpdateRequestPriorityToTaskPriority(
  priority: UpdateRequestPriority,
): "LOW" | "MEDIUM" | "HIGH" | "URGENT" {
  switch (priority) {
    case "LOW":
      return "LOW";
    case "HIGH":
      return "HIGH";
    case "URGENT":
      return "URGENT";
    default:
      return "MEDIUM";
  }
}
