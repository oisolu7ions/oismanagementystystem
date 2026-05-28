import type { Prisma, ProjectStatus, ServiceType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { serviceTypesMatchingQuery } from "@/lib/projects/constants";

export type ProjectSearchParams = {
  q?: string;
  status?: string;
  serviceType?: string;
  clientId?: string;
  packageId?: string;
};

function buildProjectWhere(params: ProjectSearchParams): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};
  const q = params.q?.trim();

  if (q) {
    const matchingServiceTypes = serviceTypesMatchingQuery(q);
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { client: { businessName: { contains: q, mode: "insensitive" } } },
      ...(matchingServiceTypes.length > 0
        ? [{ serviceType: { in: matchingServiceTypes } }]
        : []),
    ];
  }

  if (params.status) {
    where.status = params.status as ProjectStatus;
  }

  if (params.serviceType) {
    where.serviceType = params.serviceType as ServiceType;
  }

  if (params.clientId) {
    where.clientId = params.clientId;
  }

  if (params.packageId) {
    where.packageId = params.packageId;
  }

  return where;
}

export async function searchProjects(params: ProjectSearchParams = {}) {
  return prisma.project.findMany({
    where: buildProjectWhere(params),
    include: {
      client: { select: { id: true, name: true, businessName: true } },
      package: { select: { id: true, name: true, isActive: true } },
    },
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      package: true,
    },
  });
}

export async function getProjectsByClientId(clientId: string) {
  return prisma.project.findMany({
    where: { clientId },
    include: {
      package: { select: { id: true, name: true, isActive: true } },
    },
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getClientsForProjectForm() {
  return prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, businessName: true },
  });
}

export async function getClientsForProjectFilter() {
  return getClientsForProjectForm();
}

export async function getPackagesForProjectForm(currentPackageId?: string | null) {
  return prisma.package.findMany({
    where: {
      OR: [
        { isActive: true },
        ...(currentPackageId ? [{ id: currentPackageId }] : []),
      ],
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, isActive: true },
  });
}

export async function getActivePackagesForProjectFilter() {
  return prisma.package.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
