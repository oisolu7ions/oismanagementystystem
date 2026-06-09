import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import type { DocumentFileTypeValue } from "@/lib/documents/constants";
import {
  DOCUMENT_MAX_FILE_SIZE_BYTES,
  getAcceptedMimeTypesForFileType,
} from "@/lib/documents/constants";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "documents");

export type SavedDocumentFile = {
  storedFileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
};

function sanitizeOriginalFileName(fileName: string): string {
  const base = path.basename(fileName).replace(/[^\w.\-() ]+/g, "_");
  return base.slice(0, 200) || "document";
}

function extensionForMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "text/csv": ".csv",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "application/zip": ".zip",
  };
  return map[mimeType] ?? "";
}

export function getDocumentFilePath(storedFileName: string): string {
  return path.join(UPLOAD_ROOT, storedFileName);
}

export async function saveDocumentFile(
  file: File,
  fileType: DocumentFileTypeValue,
): Promise<SavedDocumentFile> {
  if (file.size === 0) {
    throw new Error("Uploaded file is empty");
  }

  if (file.size > DOCUMENT_MAX_FILE_SIZE_BYTES) {
    throw new Error("File is too large (max 10 MB)");
  }

  const allowedMimeTypes = getAcceptedMimeTypesForFileType(fileType);
  const mimeType = file.type || "application/octet-stream";

  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error("This file type is not allowed for the selected document category");
  }

  await mkdir(UPLOAD_ROOT, { recursive: true });

  const extension = extensionForMimeType(mimeType);
  const storedFileName = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(getDocumentFilePath(storedFileName), buffer);

  return {
    storedFileName,
    originalFileName: sanitizeOriginalFileName(file.name),
    mimeType,
    fileSize: file.size,
  };
}

export async function deleteStoredDocumentFile(storedFileName: string | null | undefined) {
  if (!storedFileName) return;

  try {
    await unlink(getDocumentFilePath(storedFileName));
  } catch {
    // File may already be removed.
  }
}
