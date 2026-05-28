import type { FollowUpReason, FollowUpStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  endOfDay,
  isFollowUpDueToday,
  isFollowUpOverdue,
  isFollowUpUpcoming,
  reasonsMatchingQuery,
  startOfDay,
  type FollowUpStatusValue,
} from "@/lib/follow-ups/constants";

export type FollowUpSearchParams = {
  q?: string;
  status?: string;
  reason?: string;
  leadId?: string;
  clientId?: string;
  dueToday?: string;
  overdue?: string;
  upcoming?: string;
};

const followUpListInclude = {
  lead: { select: { id: true, name: true, businessName: true } },
  client: { select: { id: true, name: true, businessName: true } },
} satisfies Prisma.FollowUpInclude;

function buildFollowUpWhere(params: FollowUpSearchParams): Prisma.FollowUpWhereInput {
  const where: Prisma.FollowUpWhereInput = {};
  const q = params.q?.trim();
  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  if (q) {
    const matchingReasons = reasonsMatchingQuery(q);
    where.OR = [
      { notes: { contains: q, mode: "insensitive" } },
      { lead: { name: { contains: q, mode: "insensitive" } } },
      { lead: { businessName: { contains: q, mode: "insensitive" } } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { client: { businessName: { contains: q, mode: "insensitive" } } },
      ...(matchingReasons.length > 0 ? [{ reason: { in: matchingReasons } }] : []),
    ];
  }

  if (params.status) {
    where.status = params.status as FollowUpStatus;
  }

  if (params.reason) {
    where.reason = params.reason as FollowUpReason;
  }

  if (params.leadId) {
    where.leadId = params.leadId;
  }

  if (params.clientId) {
    where.clientId = params.clientId;
  }

  if (params.dueToday === "1") {
    where.status = "PENDING";
    where.followUpDate = { gte: todayStart, lte: todayEnd };
  } else if (params.overdue === "1") {
    where.status = "PENDING";
    where.followUpDate = { lt: todayStart };
  } else if (params.upcoming === "1") {
    where.status = "PENDING";
    where.followUpDate = { gt: todayEnd };
  }

  return where;
}

export async function searchFollowUps(params: FollowUpSearchParams = {}) {
  return prisma.followUp.findMany({
    where: buildFollowUpWhere(params),
    include: followUpListInclude,
    orderBy: [{ followUpDate: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getFollowUpById(id: string) {
  return prisma.followUp.findUnique({
    where: { id },
    include: {
      lead: { select: { id: true, name: true, businessName: true, email: true } },
      client: { select: { id: true, name: true, businessName: true, email: true } },
    },
  });
}

export async function getFollowUpsByLeadId(leadId: string) {
  return prisma.followUp.findMany({
    where: { leadId },
    orderBy: [{ followUpDate: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getFollowUpsByClientId(clientId: string) {
  return prisma.followUp.findMany({
    where: { clientId },
    orderBy: [{ followUpDate: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getLeadsForFollowUpForm() {
  return prisma.lead.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, businessName: true },
  });
}

export async function getClientsForFollowUpForm() {
  return prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, businessName: true },
  });
}

export async function getLeadsForFollowUpFilter() {
  return getLeadsForFollowUpForm();
}

export async function getClientsForFollowUpFilter() {
  return getClientsForFollowUpForm();
}

export type FollowUpListSummary = {
  pending: number;
  dueToday: number;
  overdue: number;
  upcoming: number;
  completed: number;
};

export function computeFollowUpListSummary(
  items: { followUpDate: Date; status: FollowUpStatusValue | string }[],
): FollowUpListSummary {
  return {
    pending: items.filter((i) => i.status === "PENDING").length,
    dueToday: items.filter((i) => isFollowUpDueToday(i.followUpDate, i.status)).length,
    overdue: items.filter((i) => isFollowUpOverdue(i.followUpDate, i.status)).length,
    upcoming: items.filter((i) => isFollowUpUpcoming(i.followUpDate, i.status)).length,
    completed: items.filter((i) => i.status === "COMPLETED").length,
  };
}

export async function getFollowUpListSummary(
  params: FollowUpSearchParams = {},
): Promise<FollowUpListSummary> {
  const items = await prisma.followUp.findMany({
    where: buildFollowUpWhere(params),
    select: { followUpDate: true, status: true },
  });
  return computeFollowUpListSummary(items);
}

export async function getDashboardFollowUpStats() {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const [dueToday, overdue] = await Promise.all([
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
  ]);

  return { dueToday, overdue };
}

export async function getNextPendingFollowUps(limit = 5) {
  return prisma.followUp.findMany({
    where: { status: "PENDING" },
    include: followUpListInclude,
    orderBy: { followUpDate: "asc" },
    take: limit,
  });
}
