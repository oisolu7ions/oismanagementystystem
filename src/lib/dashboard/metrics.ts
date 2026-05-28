import type { InvoiceListSummary } from "@/actions/invoices";
import type { FollowUpReason, FollowUpStatus } from "@/generated/prisma/client";
import type { LeadStatusValue } from "@/lib/leads/constants";
import type { ProjectStatusValue } from "@/lib/projects/constants";

export type DashboardFollowUpPreview = {
  id: string;
  reason: FollowUpReason;
  status: FollowUpStatus;
  followUpDate: Date;
  lead: { id: string; name: string; businessName: string | null } | null;
  client: { id: string; name: string; businessName: string | null } | null;
};

export type DashboardLeadPreview = {
  id: string;
  name: string;
  status: LeadStatusValue;
  createdAt: Date;
};

export type DashboardProjectPreview = {
  id: string;
  name: string;
  status: ProjectStatusValue;
  updatedAt: Date;
  client: { id: string; name: string; businessName: string | null };
};

export type DashboardMetrics = {
  cards: {
    activeLeads: number;
    activeClients: number;
    openProjects: number;
    overdueTasks: number;
    pendingFollowUps: number;
    unpaidInvoices: number;
    overdueInvoices: number;
    documentsAttached: number;
  };
  taskAlerts: {
    overdue: number;
    dueSoon: number;
  };
  followUpAlerts: {
    dueToday: number;
    overdue: number;
    nextPending: DashboardFollowUpPreview[];
  };
  invoiceSnapshot: InvoiceListSummary;
  projectSnapshot: {
    inProgress: number;
    waitingOnClient: number;
    inReview: number;
    recentlyUpdated: DashboardProjectPreview[];
  };
  leadPipeline: {
    byStatus: Record<LeadStatusValue, number>;
    activeLeads: number;
    recentLeads: DashboardLeadPreview[];
  };
  lifecycle: {
    leadsTotal: number;
    consultationScheduled: number;
    proposalSent: number;
    clientsActive: number;
    projectsTotal: number;
    tasksTotal: number;
    invoicesTotal: number;
    followUpsTotal: number;
    notesTotal: number;
    documentsTotal: number;
  };
};
