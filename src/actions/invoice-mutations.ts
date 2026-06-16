"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { InvoiceStatus } from "@/generated/prisma/client";
import type { InvoiceActionState } from "@/lib/invoices/action-state";
import { getNextInvoiceNumberFromExisting } from "@/lib/invoices/invoice-number";
import { maybeGenerateReceiptOnPayment } from "@/lib/receipts/create-receipt";
import { deleteStoredReceiptFile } from "@/lib/receipts/storage";
import { prisma } from "@/lib/prisma";
import { invoiceFormSchema, invoiceInputToDbFields } from "@/lib/validators/invoice";

function revalidateInvoicePaths(
  invoiceId?: string,
  clientId?: string,
  projectId?: string | null,
) {
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  if (invoiceId) {
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath(`/dashboard/invoices/${invoiceId}/edit`);
  }
  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`);
  }
}

function formatZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): InvoiceActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

function parseInvoiceFormData(formData: FormData) {
  return invoiceFormSchema.safeParse({
    invoiceNumber: formData.get("invoiceNumber"),
    clientId: formData.get("clientId"),
    projectId: formData.get("projectId") ?? undefined,
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate") ?? undefined,
    status: formData.get("status") ?? "DRAFT",
    paymentLink: formData.get("paymentLink") ?? undefined,
    notes: formData.get("notes") ?? undefined,
    isRecurring: formData.get("isRecurring") ?? undefined,
    recurrenceInterval: formData.get("recurrenceInterval") ?? undefined,
    autoGenerateNumber: formData.get("autoGenerateNumber") ?? undefined,
  });
}

async function validateClientExists(clientId: string): Promise<string | null> {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return "Selected client not found";
  return null;
}

async function validateProjectForClient(
  projectId: string | null | undefined,
  clientId: string,
): Promise<string | null> {
  if (!projectId) return null;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return "Selected project not found";
  if (project.clientId !== clientId) {
    return "Selected project does not belong to this client";
  }
  return null;
}

async function resolveInvoiceNumber(
  invoiceNumber: string,
  autoGenerate?: boolean,
  excludeId?: string,
): Promise<{ invoiceNumber?: string; error?: InvoiceActionState }> {
  let resolved = invoiceNumber.trim();

  if (autoGenerate || !resolved) {
    const existing = await prisma.invoice.findMany({
      where: excludeId ? { id: { not: excludeId } } : undefined,
      select: { invoiceNumber: true },
    });
    resolved = getNextInvoiceNumberFromExisting(
      existing.map((invoice) => invoice.invoiceNumber),
    );
  }

  const duplicate = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: resolved,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (duplicate) {
    return {
      error: { fieldErrors: { invoiceNumber: "Invoice number already exists" } },
    };
  }

  return { invoiceNumber: resolved };
}

export async function createInvoiceAction(
  _prevState: InvoiceActionState,
  formData: FormData,
): Promise<InvoiceActionState> {
  const parsed = parseInvoiceFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const clientError = await validateClientExists(parsed.data.clientId);
  if (clientError) {
    return { fieldErrors: { clientId: clientError } };
  }

  const projectError = await validateProjectForClient(
    parsed.data.projectId,
    parsed.data.clientId,
  );
  if (projectError) {
    return { fieldErrors: { projectId: projectError } };
  }

  const numberResult = await resolveInvoiceNumber(
    parsed.data.invoiceNumber,
    parsed.data.autoGenerateNumber,
  );
  if (numberResult.error) return numberResult.error;

  const invoice = await prisma.invoice.create({
    data: {
      ...invoiceInputToDbFields({
        ...parsed.data,
        invoiceNumber: numberResult.invoiceNumber!,
      }),
    },
  });

  if (invoice.status === "PAID" && invoice.paidAt) {
    await maybeGenerateReceiptOnPayment(
      invoice.id,
      "DRAFT",
      invoice.status,
      invoice.paidAt,
    );
  }

  revalidateInvoicePaths(invoice.id, invoice.clientId, invoice.projectId);
  redirect(`/dashboard/invoices/${invoice.id}`);
}

export async function updateInvoiceAction(
  id: string,
  _prevState: InvoiceActionState,
  formData: FormData,
): Promise<InvoiceActionState> {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Invoice not found" };
  }

  const parsed = parseInvoiceFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const clientError = await validateClientExists(parsed.data.clientId);
  if (clientError) {
    return { fieldErrors: { clientId: clientError } };
  }

  const projectError = await validateProjectForClient(
    parsed.data.projectId,
    parsed.data.clientId,
  );
  if (projectError) {
    return { fieldErrors: { projectId: projectError } };
  }

  const numberResult = await resolveInvoiceNumber(
    parsed.data.invoiceNumber,
    false,
    id,
  );
  if (numberResult.error) return numberResult.error;

  const fields = invoiceInputToDbFields({
    ...parsed.data,
    invoiceNumber: numberResult.invoiceNumber!,
  });

  const paidAt =
    fields.status === "PAID"
      ? existing.paidAt ?? new Date()
      : fields.status === "CANCELLED"
        ? null
        : existing.paidAt;

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...fields,
      paidAt,
    },
  });

  await maybeGenerateReceiptOnPayment(
    id,
    existing.status,
    invoice.status,
    invoice.paidAt,
  );

  revalidateInvoicePaths(id, invoice.clientId, invoice.projectId);
  if (existing.clientId !== invoice.clientId) {
    revalidateInvoicePaths(undefined, existing.clientId, existing.projectId);
  }
  if (existing.projectId !== invoice.projectId) {
    revalidateInvoicePaths(undefined, undefined, existing.projectId);
  }

  redirect(`/dashboard/invoices/${id}`);
}

export async function deleteInvoiceAction(
  id: string,
): Promise<InvoiceActionState & { success?: boolean }> {
  const [invoice, receipts] = await Promise.all([
    prisma.invoice.findUnique({ where: { id } }),
    prisma.receipt.findMany({
      where: { invoiceId: id },
      select: { storedFileName: true },
    }),
  ]);

  if (!invoice) {
    return { error: "Invoice not found" };
  }

  await prisma.invoice.delete({ where: { id } });
  await Promise.all(receipts.map((receipt) => deleteStoredReceiptFile(receipt.storedFileName)));
  revalidateInvoicePaths(undefined, invoice.clientId, invoice.projectId);
  return { success: true };
}

export async function updateInvoiceStatusAction(
  invoiceId: string,
  status: InvoiceStatus,
): Promise<InvoiceActionState & { success?: boolean }> {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) {
    return { error: "Invoice not found" };
  }

  const paidAt = status === "PAID" ? invoice.paidAt ?? new Date() : null;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status,
      paidAt,
    },
  });

  await maybeGenerateReceiptOnPayment(
    invoiceId,
    invoice.status,
    status,
    paidAt,
  );

  revalidateInvoicePaths(invoiceId, invoice.clientId, invoice.projectId);
  return { success: true };
}

export async function forceMarkInvoiceOverdueAction(
  invoiceId: string,
): Promise<InvoiceActionState & { success?: boolean }> {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) {
    return { error: "Invoice not found" };
  }

  if (invoice.status === "PAID" || invoice.status === "CANCELLED") {
    return { error: "Paid or cancelled invoices cannot be marked overdue." };
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "OVERDUE" },
  });

  revalidateInvoicePaths(invoiceId, invoice.clientId, invoice.projectId);
  return { success: true };
}
