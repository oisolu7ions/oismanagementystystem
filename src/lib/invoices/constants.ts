export const INVOICE_RECURRENCE_INTERVAL_VALUES = [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
] as const;

export type InvoiceRecurrenceIntervalValue =
  (typeof INVOICE_RECURRENCE_INTERVAL_VALUES)[number];

export const invoiceRecurrenceOptions: {
  value: InvoiceRecurrenceIntervalValue;
  label: string;
}[] = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Every 2 weeks" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
];

export function getInvoiceRecurrenceLabel(
  interval: InvoiceRecurrenceIntervalValue | string,
): string {
  return invoiceRecurrenceOptions.find((o) => o.value === interval)?.label ?? interval;
}

export const INVOICE_STATUS_VALUES = [
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "CANCELLED",
] as const;

export type InvoiceStatusValue = (typeof INVOICE_STATUS_VALUES)[number];

export const UNPAID_INVOICE_STATUSES: InvoiceStatusValue[] = [
  "DRAFT",
  "SENT",
  "OVERDUE",
];

export const invoiceStatusOptions: { value: InvoiceStatusValue; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function getInvoiceStatusLabel(status: InvoiceStatusValue | string): string {
  return invoiceStatusOptions.find((o) => o.value === status)?.label ?? status;
}

export function formatInvoiceDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function invoiceDateToInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function isUnpaidInvoiceStatus(status: InvoiceStatusValue | string): boolean {
  return UNPAID_INVOICE_STATUSES.includes(status as InvoiceStatusValue);
}

export function isInvoiceOverdue(
  dueDate: Date | null,
  status: InvoiceStatusValue | string,
): boolean {
  if (status === "PAID" || status === "CANCELLED") return false;
  if (status === "OVERDUE") return true;
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}
