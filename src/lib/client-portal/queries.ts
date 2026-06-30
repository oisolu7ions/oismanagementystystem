import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  clientVisibleActivityWhere,
  clientVisibleDocumentWhere,
  clientVisibleInvoiceWhere,
  clientVisibleProjectWhere,
  clientVisibleTaskWhere,
  getClientSafeActivityMessage,
} from "@/lib/client-portal/visibility";

const OPEN_TASK_STATUSES = ["TODO", "IN_PROGRESS", "WAITING"] as const;

export async function getClientProfile(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      businessName: true,
      email: true,
      phone: true,
      website: true,
      status: true,
      package: { select: { name: true } },
      monthlyPlan: true,
    },
  });
}

export async function getClientPortalDashboard(clientId: string) {
  const projectWhere = clientVisibleProjectWhere(clientId);
  const taskWhere = {
    ...clientVisibleTaskWhere(clientId),
    status: { in: [...OPEN_TASK_STATUSES] },
  } satisfies Prisma.TaskWhereInput;

  const invoiceWhere = clientVisibleInvoiceWhere(clientId);
  const documentWhere = clientVisibleDocumentWhere(clientId);

  const [projects, openTasks, openTaskCount, invoices, documents, documentCount, updates] =
    await Promise.all([
      prisma.project.findMany({
        where: projectWhere,
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.task.findMany({
        where: taskWhere,
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
        take: 8,
      }),
      prisma.task.count({ where: taskWhere }),
      prisma.invoice.findMany({
        where: invoiceWhere,
        include: {
          project: { select: { id: true, name: true, clientVisible: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.documentLink.findMany({
        where: documentWhere,
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.documentLink.count({ where: documentWhere }),
      prisma.activity.findMany({
        where: clientVisibleActivityWhere(clientId),
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          project: { select: { id: true, name: true } },
        },
      }),
    ]);

  return {
    projects,
    openTasks,
    invoices,
    documents,
    updates: updates.map((activity) => ({
      ...activity,
      displayMessage: getClientSafeActivityMessage(activity),
    })),
    stats: {
      activeProjects: projects.filter((p) => p.status !== "COMPLETED").length,
      openTasks: openTaskCount,
      unpaidInvoices: invoices.filter((invoice) =>
        invoice.status === "SENT" || invoice.status === "OVERDUE",
      ).length,
      documents: documentCount,
    },
  };
}

export async function getClientPortalProjects(clientId: string) {
  return prisma.project.findMany({
    where: clientVisibleProjectWhere(clientId),
    orderBy: { updatedAt: "desc" },
  });
}

export async function getClientPortalProjectById(clientId: string, projectId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      ...clientVisibleProjectWhere(clientId),
    },
    include: {
      tasks: {
        where: { clientVisible: true },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      },
      invoices: {
        where: { clientVisible: true, status: { in: ["SENT", "PAID", "OVERDUE"] } },
        orderBy: { createdAt: "desc" },
      },
      documentLinks: {
        where: { clientVisible: true },
        orderBy: { createdAt: "desc" },
      },
      activities: {
        where: { clientVisible: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getClientPortalTasks(clientId: string) {
  return prisma.task.findMany({
    where: clientVisibleTaskWhere(clientId),
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getClientPortalInvoices(clientId: string) {
  return prisma.invoice.findMany({
    where: clientVisibleInvoiceWhere(clientId),
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export async function getClientPortalInvoiceById(clientId: string, invoiceId: string) {
  return prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      ...clientVisibleInvoiceWhere(clientId),
    },
    include: {
      project: { select: { id: true, name: true } },
    },
  });
}

export async function getClientPortalDocuments(clientId: string) {
  return prisma.documentLink.findMany({
    where: clientVisibleDocumentWhere(clientId),
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientPortalDocumentById(
  clientId: string,
  documentId: string,
) {
  return prisma.documentLink.findFirst({
    where: {
      id: documentId,
      ...clientVisibleDocumentWhere(clientId),
    },
    include: {
      project: { select: { id: true, name: true } },
    },
  });
}

export async function getClientPortalUpdates(clientId: string, limit = 50) {
  const activities = await prisma.activity.findMany({
    where: clientVisibleActivityWhere(clientId),
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      project: { select: { id: true, name: true } },
    },
  });

  return activities.map((activity) => ({
    ...activity,
    displayMessage: getClientSafeActivityMessage(activity),
  }));
}

export function getClientDocumentFileUrl(documentId: string): string {
  return `/api/client/documents/${documentId}/file`;
}
