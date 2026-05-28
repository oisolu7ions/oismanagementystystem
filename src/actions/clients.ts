import type { ClientStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ClientSearchParams = {
  q?: string;
  status?: string;
  packageId?: string;
};

function buildClientWhere(params: ClientSearchParams): Prisma.ClientWhereInput {
  const where: Prisma.ClientWhereInput = {};
  const q = params.q?.trim();

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { businessName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { website: { contains: q, mode: "insensitive" } },
    ];
  }

  if (params.status) {
    where.status = params.status as ClientStatus;
  }

  if (params.packageId) {
    where.packageId = params.packageId;
  }

  return where;
}

export async function searchClients(params: ClientSearchParams = {}) {
  return prisma.client.findMany({
    where: buildClientWhere(params),
    include: { package: true },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      package: true,
      _count: { select: { projects: true, invoices: true, noteRecords: true } },
    },
  });
}

export async function getPackagesForClientForm(currentPackageId?: string | null) {
  return prisma.package.findMany({
    where: {
      OR: [
        { isActive: true },
        ...(currentPackageId ? [{ id: currentPackageId }] : []),
      ],
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

export async function getActivePackagesForFilter() {
  return prisma.package.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
