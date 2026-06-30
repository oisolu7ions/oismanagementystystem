import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { UPDATE_REQUEST_ALLOWED_MIME_TYPES, UPDATE_REQUEST_MAX_FILE_SIZE_BYTES } from "@/lib/update-requests/constants";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "update-requests");

export type SavedUpdateRequestFile = {
  storedFileName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  fileType: string;
};

function sanitizeFileName(fileName: string): string {
  const base = path.basename(fileName).replace(/[^\w.\-() ]+/g, "_");
  return base.slice(0, 200) || "attachment";
}

function extensionForMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
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

export function getUpdateRequestFilePath(storedFileName: string): string {
  return path.join(UPLOAD_ROOT, storedFileName);
}

export async function saveUpdateRequestFile(file: File): Promise<SavedUpdateRequestFile> {
  if (file.size === 0) {
    throw new Error("Uploaded file is empty");
  }

  if (file.size > UPDATE_REQUEST_MAX_FILE_SIZE_BYTES) {
    throw new Error("File is too large (max 10 MB)");
  }

  const mimeType = file.type || "application/octet-stream";
  if (!UPDATE_REQUEST_ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error("This file type is not allowed");
  }

  await mkdir(UPLOAD_ROOT, { recursive: true });

  const extension = extensionForMimeType(mimeType);
  const storedFileName = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(getUpdateRequestFilePath(storedFileName), buffer);

  return {
    storedFileName,
    fileName: sanitizeFileName(file.name),
    mimeType,
    fileSize: file.size,
    fileType: mimeType,
  };
}

export async function deleteStoredUpdateRequestFile(storedFileName: string | null | undefined) {
  if (!storedFileName) return;

  try {
    await unlink(getUpdateRequestFilePath(storedFileName));
  } catch {
    // File may already be removed.
  }
}
