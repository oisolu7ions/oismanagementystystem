import { prisma } from "@/lib/prisma";
import { clientVisibleProjectWhere } from "@/lib/client-portal/visibility";

const clientUpdateRequestInclude = {
  project: { select: { id: true, name: true } },
  requestedByClientUser: { select: { id: true, name: true, email: true } },
  attachments: { orderBy: { createdAt: "asc" as const } },
} as const;

export async function getClientPortalUpdateRequests(clientId: string) {
  return prisma.updateRequest.findMany({
    where: { clientId },
    include: clientUpdateRequestInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getClientPortalUpdateRequestById(clientId: string, id: string) {
  return prisma.updateRequest.findFirst({
    where: { id, clientId },
    include: clientUpdateRequestInclude,
  });
}

export async function getClientPortalProjectsForUpdateRequest(clientId: string) {
  return prisma.project.findMany({
    where: clientVisibleProjectWhere(clientId),
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export function getClientUpdateRequestAttachmentFileUrl(
  updateRequestId: string,
  attachmentId: string,
): string {
  return `/api/client/update-requests/${updateRequestId}/attachments/${attachmentId}/file`;
}

export function getAdminUpdateRequestAttachmentFileUrl(
  updateRequestId: string,
  attachmentId: string,
): string {
  return `/api/update-requests/${updateRequestId}/attachments/${attachmentId}/file`;
}
