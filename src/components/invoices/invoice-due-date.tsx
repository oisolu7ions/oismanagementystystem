import {
  formatInvoiceDate,
  isInvoiceOverdue,
  type InvoiceStatusValue,
} from "@/lib/invoices/constants";
import { InvoiceOverdueBadge } from "@/components/invoices/invoice-overdue-badge";

export function InvoiceDueDate({
  dueDate,
  status,
}: {
  dueDate: Date | null;
  status: InvoiceStatusValue | string;
}) {
  const overdue = isInvoiceOverdue(dueDate, status);

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className={overdue ? "font-medium text-amber-800" : undefined}>
        {formatInvoiceDate(dueDate)}
      </span>
      {overdue ? <InvoiceOverdueBadge /> : null}
    </span>
  );
}
