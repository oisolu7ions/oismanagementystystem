import { z } from "zod";
import type { InvoiceRecurrenceInterval, InvoiceStatus } from "@/generated/prisma/client";
import {
  INVOICE_RECURRENCE_INTERVAL_VALUES,
  INVOICE_STATUS_VALUES,
} from "@/lib/invoices/constants";
import { invoiceSharingSchema } from "@/lib/validators/client-sharing";

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

export const invoiceFormSchema = invoiceSharingSchema
  .extend({
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
    isRecurring: z.preprocess(
      (value) => value === "true" || value === true,
      z.boolean().optional().default(false),
    ),
    recurrenceInterval: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z.enum(INVOICE_RECURRENCE_INTERVAL_VALUES).optional(),
    ),
    autoGenerateNumber: z.preprocess(
      (value) => value === "true" || value === true,
      z.boolean().optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurrenceInterval) {
      ctx.addIssue({
        code: "custom",
        message: "Select how often this invoice recurs",
        path: ["recurrenceInterval"],
      });
    }
  });

export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;

export function parseInvoiceDueDate(value?: string): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseInvoicePaidDate(value?: string | null): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function invoiceInputToDbFields(input: InvoiceFormInput) {
  const status = input.status as InvoiceStatus;
  const isRecurring = input.isRecurring ?? false;

  return {
    invoiceNumber: input.invoiceNumber,
    clientId: input.clientId,
    projectId: input.projectId ?? null,
    amount: input.amount,
    dueDate: parseInvoiceDueDate(input.dueDate),
    status,
    paymentLink: input.paymentLink ?? null,
    notes: input.notes ?? null,
    isRecurring,
    recurrenceInterval: isRecurring
      ? (input.recurrenceInterval as InvoiceRecurrenceInterval)
      : null,
    paidAt: status === "PAID" ? new Date() : null,
    clientVisible: input.clientVisible ?? true,
    clientNote: input.clientNote ?? null,
  };
}
