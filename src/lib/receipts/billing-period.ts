import type { InvoiceRecurrenceInterval } from "@/generated/prisma/client";

export function getBillingPeriodKey(
  interval: InvoiceRecurrenceInterval,
  date: Date = new Date(),
): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  switch (interval) {
    case "WEEKLY": {
      const week = getIsoWeek(date);
      return `${year}-W${String(week).padStart(2, "0")}`;
    }
    case "BIWEEKLY": {
      const biweek = Math.ceil(getDayOfYear(date) / 14);
      return `${year}-B${String(biweek).padStart(2, "0")}`;
    }
    case "MONTHLY":
      return `${year}-${String(month).padStart(2, "0")}`;
    case "QUARTERLY": {
      const quarter = Math.ceil(month / 3);
      return `${year}-Q${quarter}`;
    }
    case "YEARLY":
      return `${year}`;
    default:
      return `${year}-${String(month).padStart(2, "0")}`;
  }
}

export function formatBillingPeriodLabel(
  period: string,
  interval: InvoiceRecurrenceInterval,
): string {
  if (interval === "MONTHLY") {
    const match = period.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
      return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    }
  }

  if (interval === "QUARTERLY") {
    const match = period.match(/^(\d{4})-Q(\d)$/);
    if (match) {
      return `Q${match[2]} ${match[1]}`;
    }
  }

  if (interval === "YEARLY") {
    return period;
  }

  if (interval === "WEEKLY") {
    const match = period.match(/^(\d{4})-W(\d{2})$/);
    if (match) {
      return `Week ${Number(match[2])}, ${match[1]}`;
    }
  }

  if (interval === "BIWEEKLY") {
    const match = period.match(/^(\d{4})-B(\d{2})$/);
    if (match) {
      return `Period ${Number(match[2])}, ${match[1]}`;
    }
  }

  return period;
}

function getIsoWeek(date: Date): number {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}
