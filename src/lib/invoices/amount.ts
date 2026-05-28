/**
 * Best-effort parse for display totals. Returns null when the string is not numeric enough.
 */
export function parseInvoiceAmount(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;

  const normalized = value.trim().toLowerCase();
  if (
    normalized.includes("custom") ||
    normalized.includes("starting at") ||
    normalized.includes("quote")
  ) {
    return null;
  }

  const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!match) return null;

  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatInvoiceAmountTotal(total: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(total);
}

export function sumParsedAmounts(amounts: (string | null | undefined)[]): {
  total: number;
  parsedCount: number;
  skippedCount: number;
} {
  let total = 0;
  let parsedCount = 0;
  let skippedCount = 0;

  for (const amount of amounts) {
    const parsed = parseInvoiceAmount(amount);
    if (parsed === null) {
      skippedCount += 1;
    } else {
      total += parsed;
      parsedCount += 1;
    }
  }

  return { total, parsedCount, skippedCount };
}
