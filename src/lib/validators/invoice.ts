import { z } from "zod";
import type { InvoiceStatus } from "@/generated/prisma/client";
import { INVOICE_STATUS_VALUES } from "@/lib/invoices/constants";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(
    z.union([
      z.undefined(),
      z.url("Enter a valid payment link URL (include https://)"),
    ]),
  );

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
  clientId: z.string().trim().min(1, "Client is required"),
  projectId: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().optional(),
  ),
  amount: z.string().trim().min(1, "Amount is required"),
  dueDate: optionalString,
  status: z.enum(INVOICE_STATUS_VALUES, { message: "Status is required" }),
  paymentLink: optionalUrl,
  notes: optionalString,
  autoGenerateNumber: z.preprocess(
    (value) => value === "true" || value === true,
    z.boolean().optional(),
  ),
});

export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;

export function parseInvoiceDueDate(value?: string): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function invoiceInputToDbFields(input: InvoiceFormInput) {
  const status = input.status as InvoiceStatus;

  return {
    invoiceNumber: input.invoiceNumber,
    clientId: input.clientId,
    projectId: input.projectId ?? null,
    amount: input.amount,
    dueDate: parseInvoiceDueDate(input.dueDate),
    status,
    paymentLink: input.paymentLink ?? null,
    notes: input.notes ?? null,
    paidAt: status === "PAID" ? new Date() : null,
  };
}
