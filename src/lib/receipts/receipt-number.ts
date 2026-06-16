const RECEIPT_NUMBER_PREFIX = "RCP-";
const RECEIPT_NUMBER_PATTERN = /^RCP-(\d+)$/i;

export function formatReceiptNumber(sequence: number): string {
  return `${RECEIPT_NUMBER_PREFIX}${String(sequence).padStart(4, "0")}`;
}

export function parseReceiptNumberSequence(receiptNumber: string): number | null {
  const match = receiptNumber.trim().match(RECEIPT_NUMBER_PATTERN);
  if (!match) return null;
  const sequence = Number.parseInt(match[1], 10);
  return Number.isFinite(sequence) ? sequence : null;
}

export function getNextReceiptNumberFromExisting(existingNumbers: string[]): string {
  let maxSequence = 0;

  for (const receiptNumber of existingNumbers) {
    const sequence = parseReceiptNumberSequence(receiptNumber);
    if (sequence !== null && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }

  return formatReceiptNumber(maxSequence + 1);
}

export function buildReceiptFileName(receiptNumber: string): string {
  return `${receiptNumber.replace(/[^\w-]+/g, "_")}.pdf`;
}
