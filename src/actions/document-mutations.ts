"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DocumentActionState } from "@/lib/documents/action-state";
import { prisma } from "@/lib/prisma";
import { documentFormSchema, documentInputToDbFields } from "@/lib/validators/document";

function revalidateDocumentPaths(
  documentId?: string,
  clientId?: string | null,
  projectId?: string | null,
) {
  revalidatePath("/dashboard/documents");
  if (documentId) {
    revalidatePath(`/dashboard/documents/${documentId}`);
    revalidatePath(`/dashboard/documents/${documentId}/edit`);
  }
  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`);
  }
}

function formatZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): DocumentActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

function parseDocumentFormData(formData: FormData) {
  return documentFormSchema.safeParse({
    name: formData.get("name"),
    fileType: formData.get("fileType"),
    url: formData.get("url"),
    notes: formData.get("notes") ?? undefined,
    clientId: formData.get("clientId") ?? undefined,
    projectId: formData.get("projectId") ?? undefined,
  });
}

async function validateClientExists(clientId: string): Promise<string | null> {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return "Selected client not found";
  return null;
}

async function validateProjectForClient(
  projectId: string | null | undefined,
  clientId: string | null | undefined,
): Promise<{ error?: DocumentActionState; clientId?: string | null }> {
  if (!projectId) return { clientId };

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return { error: { fieldErrors: { projectId: "Selected project not found" } } };
  }

  if (clientId && project.clientId !== clientId) {
    return {
      error: {
        fieldErrors: { projectId: "Selected project does not belong to this client" },
      },
    };
  }

  return { clientId: clientId ?? project.clientId };
}

export async function createDocumentAction(
  _prevState: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  const parsed = parseDocumentFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const projectCheck = await validateProjectForClient(
    parsed.data.projectId,
    parsed.data.clientId,
  );
  if (projectCheck.error) return projectCheck.error;

  const resolvedClientId = projectCheck.clientId ?? parsed.data.clientId;

  if (resolvedClientId) {
    const clientError = await validateClientExists(resolvedClientId);
    if (clientError) return { fieldErrors: { clientId: clientError } };
  }

  const document = await prisma.documentLink.create({
    data: documentInputToDbFields({
      ...parsed.data,
      clientId: resolvedClientId,
    }),
  });

  revalidateDocumentPaths(document.id, document.clientId, document.projectId);
  redirect(`/dashboard/documents/${document.id}`);
}

export async function updateDocumentAction(
  id: string,
  _prevState: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  const existing = await prisma.documentLink.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Document not found" };
  }

  const parsed = parseDocumentFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const projectCheck = await validateProjectForClient(
    parsed.data.projectId,
    parsed.data.clientId,
  );
  if (projectCheck.error) return projectCheck.error;

  const resolvedClientId = projectCheck.clientId ?? parsed.data.clientId;

  if (resolvedClientId) {
    const clientError = await validateClientExists(resolvedClientId);
    if (clientError) return { fieldErrors: { clientId: clientError } };
  }

  const document = await prisma.documentLink.update({
    where: { id },
    data: documentInputToDbFields({
      ...parsed.data,
      clientId: resolvedClientId,
    }),
  });

  revalidateDocumentPaths(id, document.clientId, document.projectId);
  if (existing.clientId !== document.clientId) {
    revalidateDocumentPaths(undefined, existing.clientId, null);
  }
  if (existing.projectId !== document.projectId) {
    revalidateDocumentPaths(undefined, null, existing.projectId);
  }

  redirect(`/dashboard/documents/${id}`);
}

export async function deleteDocumentAction(
  id: string,
): Promise<DocumentActionState & { success?: boolean }> {
  const document = await prisma.documentLink.findUnique({ where: { id } });
  if (!document) {
    return { error: "Document not found" };
  }

  await prisma.documentLink.delete({ where: { id } });
  revalidateDocumentPaths(undefined, document.clientId, document.projectId);
  return { success: true };
}
