import {
  computeInvoiceListSummary,
  type InvoiceListSummary,
} from "@/actions/invoices";
import {
  CLOSED_PROJECT_STATUSES,
  PROJECT_IN_PROGRESS_STATUSES,
} from "@/lib/dashboard/constants";
import { endOfNext7Days, endOfToday, startOfToday } from "@/lib/dashboard/dates";
import type { DashboardMetrics } from "@/lib/dashboard/metrics";
import { LEAD_STATUS_VALUES, type LeadStatusValue } from "@/lib/leads/constants";
import { UNPAID_INVOICE_STATUSES } from "@/lib/invoices/constants";
import { prisma } from "@/lib/prisma";

const followUpPreviewInclude = {
  lead: { select: { id: true, name: true, businessName: true } },
  client: { select: { id: true, name: true, businessName: true } },
} as const;

function emptyLeadStatusCounts(): Record<LeadStatusValue, number> {
  return LEAD_STATUS_VALUES.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<LeadStatusValue, number>,
  );
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const sevenDaysEnd = endOfNext7Days();

  const taskOverdueWhere = {
    status: { not: "DONE" as const },
    dueDate: { lt: todayStart },
  };

  const taskDueSoonWhere = {
    status: { not: "DONE" as const },
    dueDate: { gte: todayStart, lte: sevenDaysEnd },
  };

  const [
    activeLeads,
    activeClients,
    openProjects,
    overdueTasks,
    pendingFollowUps,
    unpaidInvoices,
    overdueInvoices,
    documentsAttached,
    taskOverdue,
    taskDueSoon,
    followUpDueToday,
    followUpOverdue,
    nextPendingFollowUps,
    projectInProgress,
    projectWaitingOnClient,
    projectInReview,
    recentProjects,
    leadStatusGroups,
    recentLeads,
    leadsTotal,
    consultationScheduled,
    proposalSent,
    clientsActive,
    projectsTotal,
    tasksTotal,
    invoicesTotal,
    followUpsTotal,
    notesTotal,
    invoicesForSummary,
  ] = await Promise.all([
    prisma.lead.count({
      where: { status: { notIn: ["WON", "LOST"] } },
    }),
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.project.count({
      where: { status: { notIn: CLOSED_PROJECT_STATUSES } },
    }),
    prisma.task.count({ where: taskOverdueWhere }),
    prisma.followUp.count({ where: { status: "PENDING" } }),
    prisma.invoice.count({
      where: { status: { in: UNPAID_INVOICE_STATUSES } },
    }),
    prisma.invoice.count({
      where: {
        dueDate: { lt: todayStart },
        status: { notIn: ["PAID", "CANCELLED"] },
      },
    }),
    prisma.documentLink.count(),
    prisma.task.count({ where: taskOverdueWhere }),
    prisma.task.count({ where: taskDueSoonWhere }),
    prisma.followUp.count({
      where: {
        status: "PENDING",
        followUpDate: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.followUp.count({
      where: {
        status: "PENDING",
        followUpDate: { lt: todayStart },
      },
    }),
    prisma.followUp.findMany({
      where: { status: "PENDING" },
      include: followUpPreviewInclude,
      orderBy: { followUpDate: "asc" },
      take: 5,
    }),
    prisma.project.count({
      where: { status: { in: PROJECT_IN_PROGRESS_STATUSES } },
    }),
    prisma.project.count({ where: { status: "WAITING_ON_CLIENT" } }),
    prisma.project.count({ where: { status: "REVIEW" } }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        updatedAt: true,
        client: { select: { id: true, name: true, businessName: true } },
      },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, status: true, createdAt: true },
    }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "CONSULTATION_SCHEDULED" } }),
    prisma.lead.count({ where: { status: "PROPOSAL_SENT" } }),
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.project.count(),
    prisma.task.count(),
    prisma.invoice.count(),
    prisma.followUp.count(),
    prisma.note.count(),
    prisma.invoice.findMany({
      select: { amount: true, status: true, dueDate: true },
    }),
  ]);

  const byStatus = emptyLeadStatusCounts();
  for (const row of leadStatusGroups) {
    byStatus[row.status as LeadStatusValue] = row._count._all;
  }

  const invoiceSnapshot: InvoiceListSummary =
    computeInvoiceListSummary(invoicesForSummary);

  return {
    cards: {
      activeLeads,
      activeClients,
      openProjects,
      overdueTasks,
      pendingFollowUps,
      unpaidInvoices,
      overdueInvoices,
      documentsAttached,
    },
    taskAlerts: {
      overdue: taskOverdue,
      dueSoon: taskDueSoon,
    },
    followUpAlerts: {
      dueToday: followUpDueToday,
      overdue: followUpOverdue,
      nextPending: nextPendingFollowUps,
    },
    invoiceSnapshot,
    projectSnapshot: {
      inProgress: projectInProgress,
      waitingOnClient: projectWaitingOnClient,
      inReview: projectInReview,
      recentlyUpdated: recentProjects,
    },
    leadPipeline: {
      byStatus,
      activeLeads,
      recentLeads,
    },
    lifecycle: {
      leadsTotal,
      consultationScheduled,
      proposalSent,
      clientsActive,
      projectsTotal,
      tasksTotal,
      invoicesTotal,
      followUpsTotal,
      notesTotal,
      documentsTotal: documentsAttached,
    },
  };
}
