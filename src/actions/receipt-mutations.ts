"use server";

import { revalidatePath } from "next/cache";
import {
  createRecurringReceiptForPeriod,
  generateDueRecurringReceipts,
} from "@/lib/receipts/create-receipt";
import { prisma } from "@/lib/prisma";
import {
  formatBillingPeriodLabel,
  getBillingPeriodKey,
} from "@/lib/receipts/billing-period";

function revalidateInvoiceReceiptPaths(invoiceId?: string) {
  revalidatePath("/dashboard/invoices");
  if (invoiceId) {
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
  }
}

export async function generateRecurringReceiptAction(invoiceId: string) {
  try {
    const receipt = await createRecurringReceiptForPeriod(invoiceId);
    revalidateInvoiceReceiptPaths(invoiceId);
    return { receiptId: receipt.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to generate receipt",
    };
  }
}

export async function generateAllDueRecurringReceiptsAction() {
  try {
    const results = await generateDueRecurringReceipts();
    revalidatePath("/dashboard/invoices");
    for (const result of results) {
      revalidatePath(`/dashboard/invoices/${result.invoiceId}`);
    }

    const created = results.filter((result) => result.created).length;
    const skipped = results.filter(
      (result) => result.receiptId && !result.created && !result.error,
    ).length;
    const failed = results.filter((result) => result.error).length;

    return {
      total: results.length,
      created,
      skipped,
      failed,
      error:
        failed > 0
          ? `${failed} receipt${failed === 1 ? "" : "s"} could not be generated`
          : undefined,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to generate receipts",
    };
  }
}

export async function getDueRecurringReceiptsSummary() {
  const invoices = await prisma.invoice.findMany({
    where: {
      isRecurring: true,
      recurrenceInterval: { not: null },
      status: { not: "CANCELLED" },
    },
    select: {
      id: true,
      invoiceNumber: true,
      recurrenceInterval: true,
    },
  });

  const now = new Date();
  const due: { invoiceId: string; invoiceNumber: string; periodLabel: string }[] =
    [];

  for (const invoice of invoices) {
    if (!invoice.recurrenceInterval) continue;

    const billingPeriod = getBillingPeriodKey(invoice.recurrenceInterval, now);
    const existing = await prisma.receipt.findFirst({
      where: { invoiceId: invoice.id, billingPeriod },
      select: { id: true },
    });

    if (!existing) {
      due.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        periodLabel: formatBillingPeriodLabel(
          billingPeriod,
          invoice.recurrenceInterval,
        ),
      });
    }
  }

  return { count: due.length, due };
}
