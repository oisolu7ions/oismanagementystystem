"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { activitySharingSchema } from "@/lib/validators/client-sharing";

export type ClientSharingActionState = {
  error?: string;
  success?: boolean;
};

function revalidateEntityPaths(options: {
  clientId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  invoiceId?: string | null;
  documentId?: string | null;
}) {
  revalidatePath("/dashboard/clients");
  revalidatePath("/client/dashboard");
  revalidatePath("/client/updates");
  if (options.clientId) {
    revalidatePath(`/dashboard/clients/${options.clientId}`);
  }
  if (options.projectId) {
    revalidatePath(`/dashboard/projects/${options.projectId}`);
    revalidatePath(`/dashboard/projects/${options.projectId}/edit`);
  }
  if (options.taskId) {
    revalidatePath(`/dashboard/tasks/${options.taskId}`);
    revalidatePath(`/dashboard/tasks/${options.taskId}/edit`);
  }
  if (options.invoiceId) {
    revalidatePath(`/dashboard/invoices/${options.invoiceId}`);
    revalidatePath(`/dashboard/invoices/${options.invoiceId}/edit`);
  }
  if (options.documentId) {
    revalidatePath(`/dashboard/documents/${options.documentId}`);
    revalidatePath(`/dashboard/documents/${options.documentId}/edit`);
  }
}

export async function setProjectClientVisibleAction(
  projectId: string,
  clientVisible: boolean,
): Promise<ClientSharingActionState> {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { clientVisible },
  });

  revalidateEntityPaths({ clientId: project.clientId, projectId: project.id });
  return { success: true };
}

export async function hideAllProjectTasksFromClientAction(
  projectId: string,
): Promise<ClientSharingActionState> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: "Project not found" };

  await prisma.task.updateMany({
    where: { projectId },
    data: { clientVisible: false },
  });

  revalidateEntityPaths({ clientId: project.clientId, projectId });
  return { success: true };
}

export async function setTaskClientVisibleAction(
  taskId: string,
  clientVisible: boolean,
): Promise<ClientSharingActionState> {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { clientVisible },
    include: { project: { select: { clientId: true } } },
  });

  revalidateEntityPaths({
    clientId: task.project.clientId,
    projectId: task.projectId,
    taskId: task.id,
  });
  return { success: true };
}

export async function setInvoiceClientVisibleAction(
  invoiceId: string,
  clientVisible: boolean,
): Promise<ClientSharingActionState> {
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { clientVisible },
  });

  revalidateEntityPaths({
    clientId: invoice.clientId,
    projectId: invoice.projectId,
    invoiceId: invoice.id,
  });
  return { success: true };
}

export async function setDocumentClientVisibleAction(
  documentId: string,
  clientVisible: boolean,
): Promise<ClientSharingActionState> {
  const document = await prisma.documentLink.update({
    where: { id: documentId },
    data: { clientVisible },
  });

  revalidateEntityPaths({
    clientId: document.clientId,
    projectId: document.projectId,
    documentId: document.id,
  });
  return { success: true };
}

export async function updateActivityClientSharingAction(
  activityId: string,
  formData: FormData,
): Promise<ClientSharingActionState> {
  const parsed = activitySharingSchema.safeParse({
    clientVisible: formData.get("clientVisible"),
    clientMessage: formData.get("clientMessage") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const activity = await prisma.activity.update({
    where: { id: activityId },
    data: {
      clientVisible: parsed.data.clientVisible,
      clientMessage: parsed.data.clientMessage ?? null,
    },
  });

  revalidateEntityPaths({
    clientId: activity.clientId,
    projectId: activity.projectId,
  });
  revalidatePath("/dashboard/activity");
  return { success: true };
}
