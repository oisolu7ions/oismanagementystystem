export const LEAD_STATUS_VALUES = [
  "NEW",
  "CONTACTED",
  "CONSULTATION_SCHEDULED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
] as const;

export type LeadStatusValue = (typeof LEAD_STATUS_VALUES)[number];

export const LEAD_SOURCE_VALUES = [
  "INSTAGRAM",
  "FACEBOOK",
  "LINKEDIN",
  "REFERRAL",
  "WEBSITE_FORM",
  "COLD_EMAIL",
  "IN_PERSON",
  "OTHER",
] as const;

export type LeadSourceValue = (typeof LEAD_SOURCE_VALUES)[number];

export const leadStatusOptions: { value: LeadStatusValue; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "CONSULTATION_SCHEDULED", label: "Consultation Scheduled" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

export const leadSourceOptions: { value: LeadSourceValue; label: string }[] = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "REFERRAL", label: "Referral" },
  { value: "WEBSITE_FORM", label: "Website Form" },
  { value: "COLD_EMAIL", label: "Cold Email" },
  { value: "IN_PERSON", label: "In Person" },
  { value: "OTHER", label: "Other" },
];

export function getLeadStatusLabel(status: LeadStatusValue | string): string {
  return leadStatusOptions.find((o) => o.value === status)?.label ?? status;
}

export function getLeadSourceLabel(source: LeadSourceValue | string | null): string {
  if (!source) return "—";
  return leadSourceOptions.find((o) => o.value === source)?.label ?? source;
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
