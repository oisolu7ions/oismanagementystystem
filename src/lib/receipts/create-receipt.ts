import type { InvoiceStatus } from "@/generated/prisma/client";
import {
  formatBillingPeriodLabel,
  getBillingPeriodKey,
} from "@/lib/receipts/billing-period";
import { generateReceiptPdf } from "@/lib/receipts/generate-pdf";
import {
  buildReceiptFileName,
  getNextReceiptNumberFromExisting,
} from "@/lib/receipts/receipt-number";
import { saveReceiptPdf } from "@/lib/receipts/storage";
import { prisma } from "@/lib/prisma";

type CreateReceiptOptions = {
  billingPeriod?: string | null;
  billingPeriodLabel?: string | null;
};

export async function createReceiptForInvoice(
  invoiceId: string,
  paidAt: Date,
  options: CreateReceiptOptions = {},
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: {
        select: { name: true, businessName: true, email: true },
      },
      project: { select: { name: true } },
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const existingReceipts = await prisma.receipt.findMany({
    select: { receiptNumber: true },
  });
  const receiptNumber = getNextReceiptNumberFromExisting(
    existingReceipts.map((receipt) => receipt.receiptNumber),
  );

  const pdfBuffer = await generateReceiptPdf({
    receiptNumber,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.amount,
    paidAt,
    clientName: invoice.client.name,
    clientBusiness: invoice.client.businessName,
    clientEmail: invoice.client.email,
    projectName: invoice.project?.name,
    notes: invoice.notes,
    billingPeriodLabel: options.billingPeriodLabel ?? null,
  });

  const originalFileName = buildReceiptFileName(receiptNumber);
  const file = await saveReceiptPdf(pdfBuffer, originalFileName);

  return prisma.receipt.create({
    data: {
      receiptNumber,
      invoiceId: invoice.id,
      amount: invoice.amount,
      paidAt,
      billingPeriod: options.billingPeriod ?? null,
      clientName: invoice.client.name,
      clientBusiness: invoice.client.businessName,
      clientEmail: invoice.client.email,
      storedFileName: file.storedFileName,
      originalFileName: file.originalFileName,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
    },
  });
}

export async function createRecurringReceiptForPeriod(
  invoiceId: string,
  referenceDate: Date = new Date(),
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (!invoice.isRecurring || !invoice.recurrenceInterval) {
    throw new Error("This invoice is not set up as recurring");
  }

  if (invoice.status === "CANCELLED") {
    throw new Error("Cancelled invoices cannot generate receipts");
  }

  const billingPeriod = getBillingPeriodKey(invoice.recurrenceInterval, referenceDate);

  const existing = await prisma.receipt.findFirst({
    where: { invoiceId, billingPeriod },
  });

  if (existing) {
    throw new Error(
      `A receipt already exists for ${formatBillingPeriodLabel(billingPeriod, invoice.recurrenceInterval)}`,
    );
  }

  return createReceiptForInvoice(invoiceId, referenceDate, {
    billingPeriod,
    billingPeriodLabel: formatBillingPeriodLabel(
      billingPeriod,
      invoice.recurrenceInterval,
    ),
  });
}

export async function generateDueRecurringReceipts(referenceDate: Date = new Date()) {
  const invoices = await prisma.invoice.findMany({
    where: {
      isRecurring: true,
      recurrenceInterval: { not: null },
      status: { not: "CANCELLED" },
    },
    select: {
      id: true,
      recurrenceInterval: true,
    },
  });

  const results: {
    invoiceId: string;
    receiptId?: string;
    created?: boolean;
    error?: string;
  }[] = [];

  for (const invoice of invoices) {
    if (!invoice.recurrenceInterval) continue;

    const billingPeriod = getBillingPeriodKey(invoice.recurrenceInterval, referenceDate);
    const existing = await prisma.receipt.findFirst({
      where: { invoiceId: invoice.id, billingPeriod },
    });

    if (existing) {
      results.push({ invoiceId: invoice.id, receiptId: existing.id, created: false });
      continue;
    }

    try {
      const receipt = await createRecurringReceiptForPeriod(invoice.id, referenceDate);
      results.push({ invoiceId: invoice.id, receiptId: receipt.id, created: true });
    } catch (error) {
      results.push({
        invoiceId: invoice.id,
        error: error instanceof Error ? error.message : "Failed to generate receipt",
      });
    }
  }

  return results;
}

export async function maybeGenerateReceiptOnPayment(
  invoiceId: string,
  previousStatus: InvoiceStatus,
  nextStatus: InvoiceStatus,
  paidAt: Date | null,
) {
  if (nextStatus !== "PAID" || previousStatus === "PAID" || !paidAt) {
    return null;
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { isRecurring: true, recurrenceInterval: true },
  });

  if (invoice?.isRecurring && invoice.recurrenceInterval) {
    try {
      return await createRecurringReceiptForPeriod(invoiceId, paidAt);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("A receipt already exists")
      ) {
        return null;
      }
      throw error;
    }
  }

  return createReceiptForInvoice(invoiceId, paidAt);
}
