export const PROJECT_STATUS_VALUES = [
  "NOT_STARTED",
  "DISCOVERY",
  "DESIGN",
  "DEVELOPMENT",
  "REVIEW",
  "WAITING_ON_CLIENT",
  "COMPLETED",
  "PAUSED",
  "CANCELLED",
] as const;

export type ProjectStatusValue = (typeof PROJECT_STATUS_VALUES)[number];

export const SERVICE_TYPE_VALUES = [
  "WEBSITE_BUILD",
  "WEBSITE_REDESIGN",
  "CRM_INTEGRATION",
  "EMAIL_AUTOMATION",
  "BOOKING_SYSTEM",
  "DASHBOARD",
  "AI_BUSINESS_SYSTEM",
  "WEB_APP",
  "DIGITAL_INFRASTRUCTURE",
  "OTHER",
] as const;

export type ServiceTypeValue = (typeof SERVICE_TYPE_VALUES)[number];

export const projectStatusOptions: { value: ProjectStatusValue; label: string }[] = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "DISCOVERY", label: "Discovery" },
  { value: "DESIGN", label: "Design" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "REVIEW", label: "Review" },
  { value: "WAITING_ON_CLIENT", label: "Waiting on Client" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PAUSED", label: "Paused" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const serviceTypeOptions: { value: ServiceTypeValue; label: string }[] = [
  { value: "WEBSITE_BUILD", label: "Website Build" },
  { value: "WEBSITE_REDESIGN", label: "Website Redesign" },
  { value: "CRM_INTEGRATION", label: "CRM Integration" },
  { value: "EMAIL_AUTOMATION", label: "Email Automation" },
  { value: "BOOKING_SYSTEM", label: "Booking System" },
  { value: "DASHBOARD", label: "Dashboard" },
  { value: "AI_BUSINESS_SYSTEM", label: "AI Business System" },
  { value: "WEB_APP", label: "Web App" },
  { value: "DIGITAL_INFRASTRUCTURE", label: "Digital Infrastructure" },
  { value: "OTHER", label: "Other" },
];

export function getProjectStatusLabel(status: ProjectStatusValue | string): string {
  return projectStatusOptions.find((o) => o.value === status)?.label ?? status;
}

export function getServiceTypeLabel(serviceType: ServiceTypeValue | string): string {
  return serviceTypeOptions.find((o) => o.value === serviceType)?.label ?? serviceType;
}

export function formatProjectDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function projectDateToInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function serviceTypesMatchingQuery(query: string): ServiceTypeValue[] {
  const lower = query.toLowerCase();
  return serviceTypeOptions
    .filter((option) => option.label.toLowerCase().includes(lower))
    .map((option) => option.value);
}
