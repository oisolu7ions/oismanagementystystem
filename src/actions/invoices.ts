import type { InvoiceStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sumParsedAmounts } from "@/lib/invoices/amount";
import {
  isInvoiceOverdue,
  isUnpaidInvoiceStatus,
  UNPAID_INVOICE_STATUSES,
  type InvoiceStatusValue,
} from "@/lib/invoices/constants";
import { getNextInvoiceNumberFromExisting } from "@/lib/invoices/invoice-number";

export type InvoiceSearchParams = {
  q?: string;
  status?: string;
  clientId?: string;
  projectId?: string;
};

const invoiceListInclude = {
  client: { select: { id: true, name: true, businessName: true } },
  project: { select: { id: true, name: true } },
} satisfies Prisma.InvoiceInclude;

function buildInvoiceWhere(params: InvoiceSearchParams): Prisma.InvoiceWhereInput {
  const where: Prisma.InvoiceWhereInput = {};
  const q = params.q?.trim();

  if (q) {
    where.OR = [
      { invoiceNumber: { contains: q, mode: "insensitive" } },
      { amount: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { client: { businessName: { contains: q, mode: "insensitive" } } },
      { project: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (params.status) {
    where.status = params.status as InvoiceStatus;
  }

  if (params.clientId) {
    where.clientId = params.clientId;
  }

  if (params.projectId) {
    where.projectId = params.projectId;
  }

  return where;
}

export async function searchInvoices(params: InvoiceSearchParams = {}) {
  return prisma.invoice.findMany({
    where: buildInvoiceWhere(params),
    include: invoiceListInclude,
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, businessName: true, email: true } },
      project: { select: { id: true, name: true } },
    },
  });
}

export async function getInvoicesByClientId(clientId: string) {
  return prisma.invoice.findMany({
    where: { clientId },
    include: { project: { select: { id: true, name: true } } },
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getInvoicesByProjectId(projectId: string) {
  return prisma.invoice.findMany({
    where: { projectId },
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getClientsForInvoiceForm() {
  return prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, businessName: true },
  });
}

export async function getClientsForInvoiceFilter() {
  return getClientsForInvoiceForm();
}

export async function getProjectsForInvoiceForm(clientId?: string) {
  return prisma.project.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      clientId: true,
      client: { select: { id: true, name: true, businessName: true } },
    },
  });
}

export async function getProjectsForInvoiceFilter() {
  return prisma.project.findMany({
    orderBy: [{ client: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      client: { select: { id: true, name: true, businessName: true } },
    },
  });
}

export async function getSuggestedInvoiceNumber() {
  const existing = await prisma.invoice.findMany({
    select: { invoiceNumber: true },
  });
  return getNextInvoiceNumberFromExisting(
    existing.map((invoice) => invoice.invoiceNumber),
  );
}

export type InvoiceListSummary = {
  unpaidCount: number;
  overdueCount: number;
  paidCount: number;
  totalUnpaidAmount: number | null;
  totalOverdueAmount: number | null;
  unparsedAmountCount: number;
};

export function computeInvoiceListSummary(
  invoices: {
    amount: string;
    status: InvoiceStatusValue | string;
    dueDate: Date | null;
  }[],
): InvoiceListSummary {
  const unpaid = invoices.filter((i) => isUnpaidInvoiceStatus(i.status));
  const overdue = invoices.filter((i) => isInvoiceOverdue(i.dueDate, i.status));
  const paid = invoices.filter((i) => i.status === "PAID");

  const unpaidSum = sumParsedAmounts(unpaid.map((i) => i.amount));
  const overdueSum = sumParsedAmounts(overdue.map((i) => i.amount));

  return {
    unpaidCount: unpaid.length,
    overdueCount: overdue.length,
    paidCount: paid.length,
    totalUnpaidAmount:
      unpaidSum.parsedCount === 0 && unpaidSum.skippedCount > 0
        ? null
        : unpaidSum.total,
    totalOverdueAmount:
      overdueSum.parsedCount === 0 && overdueSum.skippedCount > 0
        ? null
        : overdueSum.total,
    unparsedAmountCount: Math.max(unpaidSum.skippedCount, overdueSum.skippedCount),
  };
}

export async function getInvoiceListSummary(
  params: InvoiceSearchParams = {},
): Promise<InvoiceListSummary> {
  const invoices = await prisma.invoice.findMany({
    where: buildInvoiceWhere(params),
    select: { amount: true, status: true, dueDate: true },
  });
  return computeInvoiceListSummary(invoices);
}

export { UNPAID_INVOICE_STATUSES };
