import type { InvoiceRecurrenceInterval } from "@/generated/prisma/client";
import { getInvoiceRecurrenceLabel } from "@/lib/invoices/constants";
import { Badge } from "@/components/ui/badge";

export function InvoiceRecurrenceBadge({
  isRecurring,
  recurrenceInterval,
}: {
  isRecurring: boolean;
  recurrenceInterval: InvoiceRecurrenceInterval | null;
}) {
  if (!isRecurring || !recurrenceInterval) {
    return null;
  }

  return (
    <Badge variant="muted">
      Recurring · {getInvoiceRecurrenceLabel(recurrenceInterval)}
    </Badge>
  );
}
