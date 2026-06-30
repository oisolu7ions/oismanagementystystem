"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UpdateRequestStatus } from "@/generated/prisma/client";
import { logActivity } from "@/lib/activity/log-activity";
import { revalidateActivityPaths } from "@/lib/activity/revalidate";
import { prisma } from "@/lib/prisma";
import type { UpdateRequestActionState } from "@/lib/update-requests/action-state";
import {
  getUpdateRequestStatusLabel,
  mapUpdateRequestPriorityToTaskPriority,
} from "@/lib/update-requests/constants";
import {
  deleteStoredUpdateRequestFile,
  saveUpdateRequestFile,
} from "@/lib/update-requests/storage";
import {
  applyUpdateRequestStatusFields,
  updateRequestAdminFormSchema,
  updateRequestAttachmentLinkSchema,
} from "@/lib/validators/update-request";
import { getAdminUpdateRequestAttachmentFileUrl } from "@/lib/client-portal/update-request-queries";

function revalidateUpdateRequestPaths(
  updateRequestId?: string,
  clientId?: string | null,
  projectId?: string | null,
) {
  revalidatePath("/dashboard/update-requests");
  revalidatePath("/dashboard");
  if (updateRequestId) {
    revalidatePath(`/dashboard/update-requests/${updateRequestId}`);
    revalidatePath(`/dashboard/update-requests/${updateRequestId}/edit`);
  }
  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
    revalidatePath(`/client/update-requests`);
  }
  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`);
  }
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

function parseAdminFormData(formData: FormData) {
  return updateRequestAdminFormSchema.safeParse({
    clientId: formData.get("clientId"),
    projectId: formData.get("projectId") ?? undefined,
    title: formData.get("title"),
    requestType: formData.get("requestType"),
    priority: formData.get("priority") ?? "NORMAL",
    status: formData.get("status") ?? "SUBMITTED",
    description: formData.get("description"),
    adminNotes: formData.get("adminNotes") ?? undefined,
    clientVisibleResponse: formData.get("clientVisibleResponse") ?? undefined,
    estimatedPrice: formData.get("estimatedPrice") ?? undefined,
    approvedPrice: formData.get("approvedPrice") ?? undefined,
    dueDate: formData.get("dueDate") ?? undefined,
  });
}

async function validateProjectForClient(
  projectId: string | null | undefined,
  clientId: string,
): Promise<string | null> {
  if (!projectId) return null;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return "Selected project not found";
  if (project.clientId !== clientId) return "Selected project does not belong to this client";
  return null;
}

function getUploadedFiles(formData: FormData): File[] {
  const files = formData.getAll("files");
  return files.filter(
    (value): value is File => value instanceof File && value.size > 0 && value.name !== "",
  );
}

async function createAttachmentsFromForm(
  updateRequestId: string,
  formData: FormData,
  options?: { clientUserId?: string; logContext?: { clientId: string; projectId?: string | null } },
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

    const attachment = await prisma.updateRequestAttachment.create({
      data: {
        updateRequestId,
        fileName: parsed.data.fileName ?? "External link",
        externalUrl: parsed.data.externalUrl,
        notes: parsed.data.notes,
        uploadedByClientUserId: options?.clientUserId ?? null,
      },
    });

    if (options?.logContext) {
      await logActivity({
        type: "UPDATE_REQUEST_ATTACHMENT_ADDED",
        message: `Attachment added to update request: ${attachment.fileName ?? "External link"}.`,
        clientId: options.logContext.clientId,
        projectId: options.logContext.projectId,
        updateRequestId,
      });
    }
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
        fileUrl: null,
        uploadedByClientUserId: options?.clientUserId ?? null,
      },
    });

    await prisma.updateRequestAttachment.update({
      where: { id: attachment.id },
      data: {
        fileUrl: getAdminUpdateRequestAttachmentFileUrl(updateRequestId, attachment.id),
      },
    });

    if (options?.logContext) {
      await logActivity({
        type: "UPDATE_REQUEST_ATTACHMENT_ADDED",
        message: `Attachment added to update request: ${saved.fileName}.`,
        clientId: options.logContext.clientId,
        projectId: options.logContext.projectId,
        updateRequestId,
      });
    }
  }
}

export async function createUpdateRequestAction(
  _prevState: UpdateRequestActionState,
  formData: FormData,
): Promise<UpdateRequestActionState> {
  const parsed = parseAdminFormData(formData);
  if (!parsed.success) return formatZodErrors(parsed.error.issues);

  const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
  if (!client) return { fieldErrors: { clientId: "Selected client not found" } };

  const projectError = await validateProjectForClient(parsed.data.projectId, parsed.data.clientId);
  if (projectError) return { fieldErrors: { projectId: projectError } };

  const fields = {
    clientId: parsed.data.clientId,
    projectId: parsed.data.projectId ?? null,
    title: parsed.data.title,
    requestType: parsed.data.requestType,
    priority: parsed.data.priority,
    status: parsed.data.status,
    description: parsed.data.description,
    adminNotes: parsed.data.adminNotes,
    clientVisibleResponse: parsed.data.clientVisibleResponse,
    estimatedPrice: parsed.data.estimatedPrice,
    approvedPrice: parsed.data.approvedPrice,
    dueDate: parsed.data.dueDate ? new Date(`${parsed.data.dueDate}T12:00:00`) : null,
    ...applyUpdateRequestStatusFields(parsed.data.status as UpdateRequestStatus),
  };

  const updateRequest = await prisma.updateRequest.create({ data: fields });

  await createAttachmentsFromForm(updateRequest.id, formData, {
    logContext: { clientId: updateRequest.clientId, projectId: updateRequest.projectId },
  });

  await logActivity({
    type: "UPDATE_REQUEST_CREATED",
    message: `Update request submitted: ${updateRequest.title}.`,
    clientId: updateRequest.clientId,
    projectId: updateRequest.projectId,
    updateRequestId: updateRequest.id,
  });

  revalidateUpdateRequestPaths(updateRequest.id, updateRequest.clientId, updateRequest.projectId);
  revalidateActivityPaths({
    clientId: updateRequest.clientId,
    projectId: updateRequest.projectId,
  });
  redirect(`/dashboard/update-requests/${updateRequest.id}`);
}

export async function updateUpdateRequestAction(
  updateRequestId: string,
  _prevState: UpdateRequestActionState,
  formData: FormData,
): Promise<UpdateRequestActionState> {
  const existing = await prisma.updateRequest.findUnique({ where: { id: updateRequestId } });
  if (!existing) return { error: "Update request not found" };

  const parsed = parseAdminFormData(formData);
  if (!parsed.success) return formatZodErrors(parsed.error.issues);

  const projectError = await validateProjectForClient(parsed.data.projectId, parsed.data.clientId);
  if (projectError) return { fieldErrors: { projectId: projectError } };

  const nextStatus = parsed.data.status as UpdateRequestStatus;
  const statusFields = applyUpdateRequestStatusFields(nextStatus, existing.completedAt);

  const updated = await prisma.updateRequest.update({
    where: { id: updateRequestId },
    data: {
      clientId: parsed.data.clientId,
      projectId: parsed.data.projectId ?? null,
      title: parsed.data.title,
      requestType: parsed.data.requestType,
      priority: parsed.data.priority,
      status: nextStatus,
      description: parsed.data.description,
      adminNotes: parsed.data.adminNotes,
      clientVisibleResponse: parsed.data.clientVisibleResponse,
      estimatedPrice: parsed.data.estimatedPrice,
      approvedPrice: parsed.data.approvedPrice,
      dueDate: parsed.data.dueDate ? new Date(`${parsed.data.dueDate}T12:00:00`) : null,
      ...statusFields,
    },
  });

  await createAttachmentsFromForm(updateRequestId, formData, {
    logContext: { clientId: updated.clientId, projectId: updated.projectId },
  });

  if (existing.status !== nextStatus) {
    await logActivity({
      type:
        nextStatus === "COMPLETED"
          ? "UPDATE_REQUEST_COMPLETED"
          : "UPDATE_REQUEST_STATUS_CHANGED",
      message:
        nextStatus === "COMPLETED"
          ? `Update request completed: ${updated.title}.`
          : `Update request status changed to ${getUpdateRequestStatusLabel(nextStatus)}.`,
      clientId: updated.clientId,
      projectId: updated.projectId,
      updateRequestId: updated.id,
    });
  } else {
    await logActivity({
      type: "UPDATE_REQUEST_UPDATED",
      message: `Update request updated: ${updated.title}.`,
      clientId: updated.clientId,
      projectId: updated.projectId,
      updateRequestId: updated.id,
    });
  }

  revalidateUpdateRequestPaths(updated.id, updated.clientId, updated.projectId);
  revalidateActivityPaths({ clientId: updated.clientId, projectId: updated.projectId });
  redirect(`/dashboard/update-requests/${updated.id}`);
}

export async function addAdminUpdateRequestAttachmentAction(
  updateRequestId: string,
  formData: FormData,
): Promise<UpdateRequestActionState> {
  const existing = await prisma.updateRequest.findUnique({ where: { id: updateRequestId } });
  if (!existing) return { error: "Update request not found" };

  await createAttachmentsFromForm(updateRequestId, formData, {
    logContext: { clientId: existing.clientId, projectId: existing.projectId },
  });

  revalidateUpdateRequestPaths(updateRequestId, existing.clientId, existing.projectId);
  revalidateActivityPaths({ clientId: existing.clientId, projectId: existing.projectId });
  return { success: "Attachment added" };
}

export async function createTaskFromUpdateRequestAction(
  updateRequestId: string,
): Promise<UpdateRequestActionState> {
  const updateRequest = await prisma.updateRequest.findUnique({
    where: { id: updateRequestId },
    include: { linkedTask: { select: { id: true } } },
  });

  if (!updateRequest) return { error: "Update request not found" };
  if (!updateRequest.projectId) {
    return { error: "Link a project to this request before creating a task" };
  }
  if (updateRequest.linkedTask) {
    return { error: "A task is already linked to this update request" };
  }

  const task = await prisma.task.create({
    data: {
      title: updateRequest.title,
      description: updateRequest.description,
      projectId: updateRequest.projectId,
      priority: mapUpdateRequestPriorityToTaskPriority(updateRequest.priority),
      status: "TODO",
      clientVisible: false,
      updateRequestId: updateRequest.id,
    },
  });

  await logActivity({
    type: "TASK_CREATED",
    message: `Task created from update request: ${task.title}.`,
    clientId: updateRequest.clientId,
    projectId: updateRequest.projectId,
    taskId: task.id,
    updateRequestId: updateRequest.id,
  });

  revalidateUpdateRequestPaths(updateRequest.id, updateRequest.clientId, updateRequest.projectId);
  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/tasks/${task.id}`);
  revalidateActivityPaths({
    clientId: updateRequest.clientId,
    projectId: updateRequest.projectId,
  });

  return { success: "Task created" };
}

export async function deleteUpdateRequestAttachmentAction(
  attachmentId: string,
): Promise<UpdateRequestActionState> {
  const attachment = await prisma.updateRequestAttachment.findUnique({
    where: { id: attachmentId },
    include: { updateRequest: true },
  });
  if (!attachment) return { error: "Attachment not found" };

  await deleteStoredUpdateRequestFile(attachment.storedFileName);
  await prisma.updateRequestAttachment.delete({ where: { id: attachmentId } });

  revalidateUpdateRequestPaths(
    attachment.updateRequestId,
    attachment.updateRequest.clientId,
    attachment.updateRequest.projectId,
  );
  return { success: "Attachment removed" };
}
