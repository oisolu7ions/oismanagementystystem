import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "receipts");

export function getReceiptFilePath(storedFileName: string): string {
  return path.join(UPLOAD_ROOT, storedFileName);
}

export async function saveReceiptPdf(
  buffer: Buffer,
  originalFileName: string,
): Promise<{
  storedFileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
}> {
  await mkdir(UPLOAD_ROOT, { recursive: true });

  const storedFileName = `${randomUUID()}.pdf`;
  await writeFile(getReceiptFilePath(storedFileName), buffer);

  return {
    storedFileName,
    originalFileName,
    mimeType: "application/pdf",
    fileSize: buffer.length,
  };
}

export async function deleteStoredReceiptFile(storedFileName: string | null | undefined) {
  if (!storedFileName) return;

  try {
    await unlink(getReceiptFilePath(storedFileName));
  } catch {
    // File may already be removed.
  }
}
