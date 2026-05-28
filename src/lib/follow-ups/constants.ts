export const FOLLOW_UP_STATUS_VALUES = [
  "PENDING",
  "COMPLETED",
  "MISSED",
  "CANCELLED",
] as const;

export type FollowUpStatusValue = (typeof FOLLOW_UP_STATUS_VALUES)[number];

export const FOLLOW_UP_REASON_VALUES = [
  "CONSULTATION_REMINDER",
  "PROPOSAL_FOLLOW_UP",
  "PAYMENT_REMINDER",
  "MISSING_CONTENT_REMINDER",
  "WEBSITE_REVIEW_REMINDER",
  "MONTHLY_CHECK_IN",
  "RENEWAL_REMINDER",
  "OTHER",
] as const;

export type FollowUpReasonValue = (typeof FOLLOW_UP_REASON_VALUES)[number];

export const followUpStatusOptions: { value: FollowUpStatusValue; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "MISSED", label: "Missed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const followUpReasonOptions: { value: FollowUpReasonValue; label: string }[] = [
  { value: "CONSULTATION_REMINDER", label: "Consultation reminder" },
  { value: "PROPOSAL_FOLLOW_UP", label: "Proposal follow-up" },
  { value: "PAYMENT_REMINDER", label: "Payment reminder" },
  { value: "MISSING_CONTENT_REMINDER", label: "Missing content reminder" },
  { value: "WEBSITE_REVIEW_REMINDER", label: "Website review reminder" },
  { value: "MONTHLY_CHECK_IN", label: "Monthly check-in" },
  { value: "RENEWAL_REMINDER", label: "Renewal reminder" },
  { value: "OTHER", label: "Other" },
];

export function getFollowUpStatusLabel(status: FollowUpStatusValue | string): string {
  return followUpStatusOptions.find((o) => o.value === status)?.label ?? status;
}

export function getFollowUpReasonLabel(reason: FollowUpReasonValue | string): string {
  return followUpReasonOptions.find((o) => o.value === reason)?.label ?? reason;
}

export function formatFollowUpDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function followUpDateToInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isFollowUpOverdue(
  followUpDate: Date,
  status: FollowUpStatusValue | string,
): boolean {
  if (status !== "PENDING") return false;
  return followUpDate < startOfDay();
}

export function isFollowUpDueToday(
  followUpDate: Date,
  status: FollowUpStatusValue | string,
): boolean {
  if (status !== "PENDING") return false;
  const start = startOfDay();
  const end = endOfDay();
  return followUpDate >= start && followUpDate <= end;
}

export function isFollowUpUpcoming(
  followUpDate: Date,
  status: FollowUpStatusValue | string,
): boolean {
  if (status !== "PENDING") return false;
  return followUpDate > endOfDay();
}

export function reasonsMatchingQuery(query: string): FollowUpReasonValue[] {
  const lower = query.toLowerCase();
  return followUpReasonOptions
    .filter((option) => option.label.toLowerCase().includes(lower))
    .map((option) => option.value);
}
