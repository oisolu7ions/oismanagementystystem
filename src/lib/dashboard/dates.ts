export { endOfDay, startOfDay } from "@/lib/follow-ups/constants";

/** Calendar start of today (local timezone). */
export function startOfToday(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Calendar end of today (local timezone). */
export function endOfToday(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** End of the calendar day 7 days from the reference date (inclusive window with today). */
export function endOfNext7Days(from: Date = new Date()): Date {
  const d = startOfToday(from);
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 999);
  return d;
}
