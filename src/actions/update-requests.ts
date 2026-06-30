import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const updateRequestInclude = {
  client: { select: { id: true, name: true, businessName: true, email: true } },
  project: { select: { id: true, name: true } },
  requestedByClientUser: { select: { id: true, name: true, email: true } },
  attachments: { orderBy: { createdAt: "asc" as const } },
  linkedTask: { select: { id: true, title: true } },
} satisfies Prisma.UpdateRequestInclude;

export type UpdateRequestRecord = Prisma.UpdateRequestGetPayload<{
  include: typeof updateRequestInclude;
}>;

export type UpdateRequestSearchParams = {
  q?: string;
  status?: string;
  priority?: string;
  requestType?: string;
  clientId?: string;
  projectId?: string;
};

function buildUpdateRequestWhere(params: UpdateRequestSearchParams): Prisma.UpdateRequestWhereInput {
  const where: Prisma.UpdateRequestWhereInput = {};

  if (params.status) {
    where.status = params.status as Prisma.EnumUpdateRequestStatusFilter["equals"];
  }
  if (params.priority) {
    where.priority = params.priority as Prisma.EnumUpdateRequestPriorityFilter["equals"];
  }
  if (params.requestType) {
    where.requestType = params.requestType as Prisma.EnumUpdateRequestTypeFilter["equals"];
  }
  if (params.clientId) {
    where.clientId = params.clientId;
  }
  if (params.projectId) {
    where.projectId = params.projectId;
  }
  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { client: { businessName: { contains: q, mode: "insensitive" } } },
      { project: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function searchUpdateRequests(params: UpdateRequestSearchParams = {}) {
  return prisma.updateRequest.findMany({
    where: buildUpdateRequestWhere(params),
    include: updateRequestInclude,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getUpdateRequestById(id: string) {
  return prisma.updateRequest.findUnique({
    where: { id },
    include: updateRequestInclude,
  });
}

export async function getUpdateRequestsByClientId(clientId: string, limit = 20) {
  return prisma.updateRequest.findMany({
    where: { clientId },
    include: updateRequestInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function getUpdateRequestsByProjectId(projectId: string, limit = 20) {
  return prisma.updateRequest.findMany({
    where: { projectId },
    include: updateRequestInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function getClientsForUpdateRequestFilter() {
  return prisma.client.findMany({
    select: { id: true, name: true, businessName: true },
    orderBy: { name: "asc" },
  });
}

export async function getProjectsForUpdateRequestFilter(clientId?: string) {
  return prisma.project.findMany({
    where: clientId ? { clientId } : undefined,
    select: { id: true, name: true, clientId: true },
    orderBy: { name: "asc" },
  });
}

export async function getUpdateRequestListSummary(params: UpdateRequestSearchParams = {}) {
  const where = buildUpdateRequestWhere(params);
  const [total, submitted, needsInfo, inProgress, urgent] = await Promise.all([
    prisma.updateRequest.count({ where }),
    prisma.updateRequest.count({ where: { ...where, status: "SUBMITTED" } }),
    prisma.updateRequest.count({
      where: { ...where, status: "NEEDS_MORE_INFORMATION" },
    }),
    prisma.updateRequest.count({
      where: {
        ...where,
        status: { in: ["UNDER_REVIEW", "APPROVED", "SCHEDULED", "IN_PROGRESS", "WAITING_ON_CLIENT"] },
      },
    }),
    prisma.updateRequest.count({ where: { ...where, priority: "URGENT" } }),
  ]);

  return { total, submitted, needsInfo, inProgress, urgent };
}
