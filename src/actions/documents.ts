import type { DocumentFileType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { fileTypesMatchingQuery } from "@/lib/documents/constants";

export type DocumentSearchParams = {
  q?: string;
  fileType?: string;
  clientId?: string;
  projectId?: string;
};

const documentListInclude = {
  client: { select: { id: true, name: true, businessName: true } },
  project: {
    select: {
      id: true,
      name: true,
      clientId: true,
      client: { select: { id: true, name: true, businessName: true } },
    },
  },
} satisfies Prisma.DocumentLinkInclude;

function buildDocumentWhere(params: DocumentSearchParams): Prisma.DocumentLinkWhereInput {
  const and: Prisma.DocumentLinkWhereInput[] = [];
  const q = params.q?.trim();

  if (q) {
    const matchingTypes = fileTypesMatchingQuery(q);
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { url: { contains: q, mode: "insensitive" } },
        { originalFileName: { contains: q, mode: "insensitive" } },
        { client: { name: { contains: q, mode: "insensitive" } } },
        { client: { businessName: { contains: q, mode: "insensitive" } } },
        { project: { name: { contains: q, mode: "insensitive" } } },
        ...(matchingTypes.length > 0 ? [{ fileType: { in: matchingTypes } }] : []),
      ],
    });
  }

  if (params.fileType) {
    and.push({ fileType: params.fileType as DocumentFileType });
  }

  if (params.clientId) {
    and.push({
      OR: [{ clientId: params.clientId }, { project: { clientId: params.clientId } }],
    });
  }

  if (params.projectId) {
    and.push({ projectId: params.projectId });
  }

  return and.length > 0 ? { AND: and } : {};
}

export async function searchDocuments(params: DocumentSearchParams = {}) {
  return prisma.documentLink.findMany({
    where: buildDocumentWhere(params),
    include: documentListInclude,
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getDocumentById(id: string) {
  return prisma.documentLink.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, businessName: true } },
      project: {
        select: {
          id: true,
          name: true,
          client: { select: { id: true, name: true, businessName: true } },
        },
      },
    },
  });
}

export async function getDocumentsByClientId(clientId: string) {
  return prisma.documentLink.findMany({
    where: {
      OR: [{ clientId }, { project: { clientId } }],
    },
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getDocumentsByProjectId(projectId: string) {
  return prisma.documentLink.findMany({
    where: { projectId },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getClientsForDocumentForm() {
  return prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, businessName: true },
  });
}

export async function getProjectsForDocumentForm(clientId?: string) {
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

export async function getClientsForDocumentFilter() {
  return getClientsForDocumentForm();
}

export async function getProjectsForDocumentFilter() {
  return prisma.project.findMany({
    orderBy: [{ client: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      client: { select: { id: true, name: true, businessName: true } },
    },
  });
}

export async function getProjectForDocumentPrefill(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      clientId: true,
      client: { select: { id: true, name: true, businessName: true } },
    },
  });
}
