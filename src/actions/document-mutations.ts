"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DocumentActionState } from "@/lib/documents/action-state";
import {
  DOCUMENT_FILE_TYPE_VALUES,
  isLinkOnlyDocumentType,
  type DocumentFileTypeValue,
} from "@/lib/documents/constants";
import { deleteStoredDocumentFile, saveDocumentFile } from "@/lib/documents/storage";
import { logActivity } from "@/lib/activity/log-activity";
import { revalidateActivityPaths } from "@/lib/activity/revalidate";
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

function parseFileType(value: FormDataEntryValue | null): DocumentFileTypeValue | null {
  if (typeof value !== "string") return null;
  return DOCUMENT_FILE_TYPE_VALUES.includes(value as DocumentFileTypeValue)
    ? (value as DocumentFileTypeValue)
    : null;
}

function parseDocumentFormData(formData: FormData) {
  const sourceType = formData.get("sourceType");
  const fileType = parseFileType(formData.get("fileType"));

  return documentFormSchema.safeParse({
    name: formData.get("name"),
    fileType,
    sourceType:
      fileType && isLinkOnlyDocumentType(fileType) ? "LINK" : sourceType,
    url: formData.get("url") ?? undefined,
    notes: formData.get("notes") ?? undefined,
    clientId: formData.get("clientId") ?? undefined,
    projectId: formData.get("projectId") ?? undefined,
    clientVisible: formData.get("clientVisible") ?? undefined,
    clientDescription: formData.get("clientDescription") ?? undefined,
  });
}

function getUploadedFile(formData: FormData): File | null {
  const value = formData.get("file");
  if (!(value instanceof File) || value.size === 0 || value.name === "") {
    return null;
  }
  return value;
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

  const uploadedFile = getUploadedFile(formData);
  const effectiveSourceType = isLinkOnlyDocumentType(parsed.data.fileType)
    ? "LINK"
    : parsed.data.sourceType;

  if (effectiveSourceType === "FILE" && !uploadedFile) {
    return { fieldErrors: { file: "Select a file to upload" } };
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

  let fileFields: Awaited<ReturnType<typeof saveDocumentFile>> | null = null;

  if (effectiveSourceType === "FILE" && uploadedFile) {
    try {
      fileFields = await saveDocumentFile(uploadedFile, parsed.data.fileType);
    } catch (error) {
      return {
        fieldErrors: {
          file: error instanceof Error ? error.message : "Failed to save uploaded file",
        },
      };
    }
  }

  const document = await prisma.documentLink.create({
    data: documentInputToDbFields(
      {
        ...parsed.data,
        clientId: resolvedClientId,
      },
      fileFields,
    ),
  });

  await logActivity({
    type: "DOCUMENT_CREATED",
    message: `Document added: ${document.name}.`,
    clientId: document.clientId,
    projectId: document.projectId,
    documentLinkId: document.id,
  });

  revalidateDocumentPaths(document.id, document.clientId, document.projectId);
  revalidateActivityPaths({
    clientId: document.clientId,
    projectId: document.projectId,
  });
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

  const uploadedFile = getUploadedFile(formData);
  const effectiveSourceType = isLinkOnlyDocumentType(parsed.data.fileType)
    ? "LINK"
    : parsed.data.sourceType;

  if (effectiveSourceType === "FILE" && !uploadedFile && !existing.storedFileName) {
    return { fieldErrors: { file: "Select a file to upload" } };
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

  let fileFields: Awaited<ReturnType<typeof saveDocumentFile>> | null = null;

  if (effectiveSourceType === "FILE" && uploadedFile) {
    try {
      fileFields = await saveDocumentFile(uploadedFile, parsed.data.fileType);
    } catch (error) {
      return {
        fieldErrors: {
          file: error instanceof Error ? error.message : "Failed to save uploaded file",
        },
      };
    }
  } else if (effectiveSourceType === "FILE" && existing.storedFileName) {
    fileFields = {
      storedFileName: existing.storedFileName,
      originalFileName: existing.originalFileName ?? existing.name,
      mimeType: existing.mimeType ?? "application/octet-stream",
      fileSize: existing.fileSize ?? 0,
    };
  }

  const document = await prisma.documentLink.update({
    where: { id },
    data: documentInputToDbFields(
      {
        ...parsed.data,
        clientId: resolvedClientId,
      },
      fileFields,
    ),
  });

  if (effectiveSourceType === "LINK" && existing.storedFileName) {
    await deleteStoredDocumentFile(existing.storedFileName);
  }

  if (
    effectiveSourceType === "FILE" &&
    uploadedFile &&
    existing.storedFileName &&
    existing.storedFileName !== document.storedFileName
  ) {
    await deleteStoredDocumentFile(existing.storedFileName);
  }

  await logActivity({
    type: "DOCUMENT_UPDATED",
    message: `Document updated: ${document.name}.`,
    clientId: document.clientId,
    projectId: document.projectId,
    documentLinkId: document.id,
  });

  revalidateDocumentPaths(id, document.clientId, document.projectId);
  revalidateActivityPaths({
    clientId: document.clientId,
    projectId: document.projectId,
  });
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
  await deleteStoredDocumentFile(document.storedFileName);
  revalidateDocumentPaths(undefined, document.clientId, document.projectId);
  return { success: true };
}
