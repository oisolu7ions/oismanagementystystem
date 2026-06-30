import type { ActivityType } from "@/generated/prisma/client";

export const ACTIVITY_TYPE_VALUES = [
  "LEAD_CREATED",
  "LEAD_UPDATED",
  "LEAD_CONVERTED",
  "CLIENT_CREATED",
  "CLIENT_UPDATED",
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "TASK_CREATED",
  "TASK_UPDATED",
  "TASK_COMPLETED",
  "INVOICE_CREATED",
  "INVOICE_UPDATED",
  "INVOICE_SENT",
  "INVOICE_PAID",
  "FOLLOW_UP_CREATED",
  "FOLLOW_UP_UPDATED",
  "FOLLOW_UP_COMPLETED",
  "NOTE_CREATED",
  "NOTE_UPDATED",
  "DOCUMENT_CREATED",
  "DOCUMENT_UPDATED",
  "UPDATE_REQUEST_CREATED",
  "UPDATE_REQUEST_UPDATED",
  "UPDATE_REQUEST_STATUS_CHANGED",
  "UPDATE_REQUEST_COMPLETED",
  "UPDATE_REQUEST_ATTACHMENT_ADDED",
] as const satisfies readonly ActivityType[];

export type ActivityTypeValue = (typeof ACTIVITY_TYPE_VALUES)[number];

export const activityTypeLabels: Record<ActivityTypeValue, string> = {
  LEAD_CREATED: "Lead created",
  LEAD_UPDATED: "Lead updated",
  LEAD_CONVERTED: "Lead converted",
  CLIENT_CREATED: "Client created",
  CLIENT_UPDATED: "Client updated",
  PROJECT_CREATED: "Project created",
  PROJECT_UPDATED: "Project updated",
  TASK_CREATED: "Task created",
  TASK_UPDATED: "Task updated",
  TASK_COMPLETED: "Task completed",
  INVOICE_CREATED: "Invoice created",
  INVOICE_UPDATED: "Invoice updated",
  INVOICE_SENT: "Invoice sent",
  INVOICE_PAID: "Invoice paid",
  FOLLOW_UP_CREATED: "Follow-up created",
  FOLLOW_UP_UPDATED: "Follow-up updated",
  FOLLOW_UP_COMPLETED: "Follow-up completed",
  NOTE_CREATED: "Note created",
  NOTE_UPDATED: "Note updated",
  DOCUMENT_CREATED: "Document added",
  DOCUMENT_UPDATED: "Document updated",
  UPDATE_REQUEST_CREATED: "Update request created",
  UPDATE_REQUEST_UPDATED: "Update request updated",
  UPDATE_REQUEST_STATUS_CHANGED: "Update request status changed",
  UPDATE_REQUEST_COMPLETED: "Update request completed",
  UPDATE_REQUEST_ATTACHMENT_ADDED: "Update request attachment added",
};

const activityTypeVariants: Record<
  ActivityTypeValue,
  "default" | "success" | "warning" | "info" | "muted"
> = {
  LEAD_CREATED: "info",
  LEAD_UPDATED: "default",
  LEAD_CONVERTED: "success",
  CLIENT_CREATED: "info",
  CLIENT_UPDATED: "default",
  PROJECT_CREATED: "info",
  PROJECT_UPDATED: "default",
  TASK_CREATED: "info",
  TASK_UPDATED: "default",
  TASK_COMPLETED: "success",
  INVOICE_CREATED: "info",
  INVOICE_UPDATED: "default",
  INVOICE_SENT: "info",
  INVOICE_PAID: "success",
  FOLLOW_UP_CREATED: "info",
  FOLLOW_UP_UPDATED: "default",
  FOLLOW_UP_COMPLETED: "success",
  NOTE_CREATED: "info",
  NOTE_UPDATED: "default",
  DOCUMENT_CREATED: "info",
  DOCUMENT_UPDATED: "default",
  UPDATE_REQUEST_CREATED: "info",
  UPDATE_REQUEST_UPDATED: "default",
  UPDATE_REQUEST_STATUS_CHANGED: "default",
  UPDATE_REQUEST_COMPLETED: "success",
  UPDATE_REQUEST_ATTACHMENT_ADDED: "info",
};

export function getActivityTypeLabel(type: ActivityType | string): string {
  return activityTypeLabels[type as ActivityTypeValue] ?? type;
}

export function getActivityTypeVariant(
  type: ActivityType | string,
): "default" | "success" | "warning" | "info" | "muted" {
  return activityTypeVariants[type as ActivityTypeValue] ?? "default";
}
