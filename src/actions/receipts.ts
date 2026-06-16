import { prisma } from "@/lib/prisma";

export async function getReceiptsByInvoiceId(invoiceId: string) {
  return prisma.receipt.findMany({
    where: { invoiceId },
    orderBy: { createdAt: "desc" },
  });
}

export function getReceiptFileUrl(receiptId: string): string {
  return `/api/receipts/${receiptId}/file`;
}
