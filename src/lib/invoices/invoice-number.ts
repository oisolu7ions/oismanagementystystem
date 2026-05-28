const INVOICE_NUMBER_PREFIX = "OIS-";
const INVOICE_NUMBER_PATTERN = /^OIS-(\d+)$/i;

export function formatInvoiceNumber(sequence: number): string {
  return `${INVOICE_NUMBER_PREFIX}${String(sequence).padStart(4, "0")}`;
}

export function parseInvoiceNumberSequence(invoiceNumber: string): number | null {
  const match = invoiceNumber.trim().match(INVOICE_NUMBER_PATTERN);
  if (!match) return null;
  const sequence = Number.parseInt(match[1], 10);
  return Number.isFinite(sequence) ? sequence : null;
}

export function getNextInvoiceNumberFromExisting(existingNumbers: string[]): string {
  let maxSequence = 0;

  for (const invoiceNumber of existingNumbers) {
    const sequence = parseInvoiceNumberSequence(invoiceNumber);
    if (sequence !== null && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }

  return formatInvoiceNumber(maxSequence + 1);
}
