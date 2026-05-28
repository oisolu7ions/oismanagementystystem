import {
  getInvoiceStatusLabel,
  type InvoiceStatusValue,
} from "@/lib/invoices/constants";
import { Badge } from "@/components/ui/badge";

const statusVariants: Record<
  InvoiceStatusValue,
  "default" | "success" | "warning" | "info" | "muted"
> = {
  DRAFT: "muted",
  SENT: "info",
  PAID: "success",
  OVERDUE: "warning",
  CANCELLED: "muted",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatusValue }) {
  return (
    <Badge variant={statusVariants[status]}>
      {getInvoiceStatusLabel(status)}
    </Badge>
  );
}
