"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logActivity } from "@/lib/activity/log-activity";
import { getClientSession } from "@/lib/auth/client-session";
import {
  getClientUpdateRequestAttachmentFileUrl,
  getClientPortalProjectsForUpdateRequest,
} from "@/lib/client-portal/update-request-queries";
import { clientVisibleProjectWhere } from "@/lib/client-portal/visibility";
import { prisma } from "@/lib/prisma";
import type { UpdateRequestActionState } from "@/lib/update-requests/action-state";
import {
  CLIENT_CANCELLABLE_UPDATE_REQUEST_STATUSES,
  CLIENT_EDITABLE_UPDATE_REQUEST_STATUSES,
} from "@/lib/update-requests/constants";
import { saveUpdateRequestFile } from "@/lib/update-requests/storage";
import {
  updateRequestAttachmentLinkSchema,
  updateRequestClientFormSchema,
  updateRequestClientInputToDbFields,
} from "@/lib/validators/update-request";

function revalidateClientUpdateRequestPaths(clientId: string, updateRequestId?: string) {
  revalidatePath("/client/update-requests");
  revalidatePath("/client/dashboard");
  if (updateRequestId) {
    revalidatePath(`/client/update-requests/${updateRequestId}`);
  }
  revalidatePath(`/dashboard/clients/${clientId}`);
}

function formatZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): UpdateRequestActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

function getUploadedFiles(formData: FormData): File[] {
  const files = formData.getAll("files");
  return files.filter(
    (value): value is File => value instanceof File && value.size > 0 && value.name !== "",
  );
}

async function validateClientProject(projectId: string | undefined, clientId: string) {
  if (!projectId) return null;
  const project = await prisma.project.findFirst({
    where: { id: projectId, ...clientVisibleProjectWhere(clientId) },
  });
  if (!project) return "Selected project not found";
  return null;
}

async function createClientAttachments(
  updateRequestId: string,
  clientId: string,
  clientUserId: string,
  formData: FormData,
  projectId?: string | null,
) {
  const externalUrls = formData.getAll("externalUrl").map(String).filter(Boolean);
  const externalNames = formData.getAll("externalName").map(String);
  const externalNotes = formData.getAll("externalNotes").map(String);

  for (let index = 0; index < externalUrls.length; index += 1) {
    const parsed = updateRequestAttachmentLinkSchema.safeParse({
      externalUrl: externalUrls[index],
      fileName: externalNames[index] ?? undefined,
      notes: externalNotes[index] ?? undefined,
    });
    if (!parsed.success) continue;

    await prisma.updateRequestAttachment.create({
      data: {
        updateRequestId,
        fileName: parsed.data.fileName ?? "External link",
        externalUrl: parsed.data.externalUrl,
        notes: parsed.data.notes,
        uploadedByClientUserId: clientUserId,
      },
    });

    await logActivity({
      type: "UPDATE_REQUEST_ATTACHMENT_ADDED",
      message: "Attachment added to update request.",
      clientId,
      projectId,
      updateRequestId,
    });
  }

  for (const file of getUploadedFiles(formData)) {
    const saved = await saveUpdateRequestFile(file);
    const attachment = await prisma.updateRequestAttachment.create({
      data: {
        updateRequestId,
        fileName: saved.fileName,
        fileType: saved.fileType,
        fileSize: saved.fileSize,
        storedFileName: saved.storedFileName,
        mimeType: saved.mimeType,
        uploadedByClientUserId: clientUserId,
      },
    });

    await prisma.updateRequestAttachment.update({
      where: { id: attachment.id },
      data: {
        fileUrl: getClientUpdateRequestAttachmentFileUrl(updateRequestId, attachment.id),
      },
    });

    await logActivity({
      type: "UPDATE_REQUEST_ATTACHMENT_ADDED",
      message: "Attachment added to update request.",
      clientId,
      projectId,
      updateRequestId,
    });
  }
}

export async function createClientUpdateRequestAction(
  _prevState: UpdateRequestActionState,
  formData: FormData,
): Promise<UpdateRequestActionState> {
  const session = await getClientSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = updateRequestClientFormSchema.safeParse({
    title: formData.get("title"),
    requestType: formData.get("requestType"),
    priority: formData.get("priority") ?? "NORMAL",
    description: formData.get("description"),
    projectId: formData.get("projectId") ?? undefined,
  });
  if (!parsed.success) return formatZodErrors(parsed.error.issues);

  const projectError = await validateClientProject(parsed.data.projectId, session.clientId);
  if (projectError) return { fieldErrors: { projectId: projectError } };

  const fields = updateRequestClientInputToDbFields(parsed.data);
  const updateRequest = await prisma.updateRequest.create({
    data: {
      ...fields,
      clientId: session.clientId,
      requestedByClientUserId: session.clientUserId,
    },
  });

  await createClientAttachments(
    updateRequest.id,
    session.clientId,
    session.clientUserId,
    formData,
    updateRequest.projectId,
  );

  await logActivity({
    type: "UPDATE_REQUEST_CREATED",
    message: `Update request submitted: ${updateRequest.title}.`,
    clientId: session.clientId,
    projectId: updateRequest.projectId,
    updateRequestId: updateRequest.id,
    clientVisible: true,
    clientMessage: `Your update request "${updateRequest.title}" was submitted.`,
  });

  revalidateClientUpdateRequestPaths(session.clientId, updateRequest.id);
  redirect(`/client/update-requests/${updateRequest.id}`);
}

export async function updateClientUpdateRequestAction(
  updateRequestId: string,
  _prevState: UpdateRequestActionState,
  formData: FormData,
): Promise<UpdateRequestActionState> {
  const session = await getClientSession();
  if (!session) return { error: "Unauthorized" };

  const existing = await prisma.updateRequest.findFirst({
    where: { id: updateRequestId, clientId: session.clientId },
  });
  if (!existing) return { error: "Update request not found" };
  if (
    !CLIENT_EDITABLE_UPDATE_REQUEST_STATUSES.includes(
      existing.status as (typeof CLIENT_EDITABLE_UPDATE_REQUEST_STATUSES)[number],
    )
  ) {
    return { error: "This request can no longer be edited" };
  }

  const parsed = updateRequestClientFormSchema.safeParse({
    title: formData.get("title"),
    requestType: formData.get("requestType"),
    priority: formData.get("priority") ?? "NORMAL",
    description: formData.get("description"),
    projectId: formData.get("projectId") ?? undefined,
  });
  if (!parsed.success) return formatZodErrors(parsed.error.issues);

  const projectError = await validateClientProject(parsed.data.projectId, session.clientId);
  if (projectError) return { fieldErrors: { projectId: projectError } };

  const fields = updateRequestClientInputToDbFields(parsed.data);
  const updated = await prisma.updateRequest.update({
    where: { id: updateRequestId },
    data: {
      title: fields.title,
      requestType: fields.requestType,
      priority: fields.priority,
      description: fields.description,
      projectId: fields.projectId,
      status: existing.status === "NEEDS_MORE_INFORMATION" ? "SUBMITTED" : existing.status,
    },
  });

  await createClientAttachments(
    updateRequestId,
    session.clientId,
    session.clientUserId,
    formData,
    updated.projectId,
  );

  await logActivity({
    type: "UPDATE_REQUEST_UPDATED",
    message: `Update request updated: ${updated.title}.`,
    clientId: session.clientId,
    projectId: updated.projectId,
    updateRequestId: updated.id,
  });

  revalidateClientUpdateRequestPaths(session.clientId, updated.id);
  redirect(`/client/update-requests/${updated.id}`);
}

export async function cancelClientUpdateRequestAction(
  updateRequestId: string,
): Promise<UpdateRequestActionState> {
  const session = await getClientSession();
  if (!session) return { error: "Unauthorized" };

  const existing = await prisma.updateRequest.findFirst({
    where: { id: updateRequestId, clientId: session.clientId },
  });
  if (!existing) return { error: "Update request not found" };
  if (
    !CLIENT_CANCELLABLE_UPDATE_REQUEST_STATUSES.includes(
      existing.status as (typeof CLIENT_CANCELLABLE_UPDATE_REQUEST_STATUSES)[number],
    )
  ) {
    return { error: "This request can no longer be cancelled" };
  }

  await prisma.updateRequest.update({
    where: { id: updateRequestId },
    data: { status: "CANCELLED", completedAt: null },
  });

  await logActivity({
    type: "UPDATE_REQUEST_STATUS_CHANGED",
    message: `Update request cancelled: ${existing.title}.`,
    clientId: session.clientId,
    projectId: existing.projectId,
    updateRequestId: existing.id,
  });

  revalidateClientUpdateRequestPaths(session.clientId, updateRequestId);
  return { success: "Request cancelled" };
}

export async function getClientProjectsForUpdateRequestForm() {
  const session = await getClientSession();
  if (!session) return [];
  return getClientPortalProjectsForUpdateRequest(session.clientId);
}
