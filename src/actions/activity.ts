import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const activityInclude = {
  lead: { select: { id: true, name: true } },
  client: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
  task: { select: { id: true, title: true } },
  invoice: { select: { id: true, invoiceNumber: true } },
  followUp: { select: { id: true, reason: true } },
  note: { select: { id: true, title: true } },
  documentLink: { select: { id: true, name: true } },
} satisfies Prisma.ActivityInclude;

export type ActivityRecord = Prisma.ActivityGetPayload<{
  include: typeof activityInclude;
}>;

const defaultOrder = { createdAt: "desc" as const };

export async function getRecentActivity(limit = 10): Promise<ActivityRecord[]> {
  return prisma.activity.findMany({
    include: activityInclude,
    orderBy: defaultOrder,
    take: limit,
  });
}

export async function getAllActivity(limit = 100): Promise<ActivityRecord[]> {
  return prisma.activity.findMany({
    include: activityInclude,
    orderBy: defaultOrder,
    take: limit,
  });
}

export async function getActivityByLeadId(
  leadId: string,
  limit = 50,
): Promise<ActivityRecord[]> {
  return prisma.activity.findMany({
    where: { leadId },
    include: activityInclude,
    orderBy: defaultOrder,
    take: limit,
  });
}

export async function getActivityByClientId(
  clientId: string,
  limit = 50,
): Promise<ActivityRecord[]> {
  return prisma.activity.findMany({
    where: { clientId },
    include: activityInclude,
    orderBy: defaultOrder,
    take: limit,
  });
}

export async function getActivityByProjectId(
  projectId: string,
  limit = 50,
): Promise<ActivityRecord[]> {
  return prisma.activity.findMany({
    where: { projectId },
    include: activityInclude,
    orderBy: defaultOrder,
    take: limit,
  });
}
