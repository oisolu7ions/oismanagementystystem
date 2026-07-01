import path from "path";

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

export type UploadValidationResult = {
  mimeType: string;
  extension: string;
};

type UploadValidationInput = {
  file: File;
  allowedMimeTypes: readonly string[];
  maxFileSizeBytes: number;
};

type UploadBatchValidationInput = {
  files: File[];
  maxFiles: number;
  maxTotalSizeBytes: number;
};

const MAX_ORIGINAL_FILE_NAME_LENGTH = 200;

const MIME_EXTENSION_MAP: Record<string, readonly string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "text/plain": [".txt"],
  "text/markdown": [".md", ".markdown"],
  "text/csv": [".csv"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "application/zip": [".zip"],
};

const BLOCKED_EXTENSIONS = new Set([
  ".app",
  ".bat",
  ".cmd",
  ".com",
  ".cpl",
  ".csh",
  ".dll",
  ".exe",
  ".gadget",
  ".hta",
  ".htm",
  ".html",
  ".jar",
  ".js",
  ".jse",
  ".jsx",
  ".ksh",
  ".lnk",
  ".mjs",
  ".msi",
  ".php",
  ".pl",
  ".ps1",
  ".py",
  ".rb",
  ".scr",
  ".sh",
  ".svg",
  ".ts",
  ".tsx",
  ".vb",
  ".vbe",
  ".vbs",
  ".wsf",
]);

function getSafeOriginalName(fileName: string): string {
  return path.basename(fileName).trim();
}

export function validateUploadBatch({
  files,
  maxFiles,
  maxTotalSizeBytes,
}: UploadBatchValidationInput): void {
  if (files.length > maxFiles) {
    throw new UploadValidationError(`Upload up to ${maxFiles} file${maxFiles === 1 ? "" : "s"} at a time.`);
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > maxTotalSizeBytes) {
    throw new UploadValidationError(`Total upload size must be ${Math.floor(maxTotalSizeBytes / (1024 * 1024))} MB or less.`);
  }
}

export function validateUploadedFile({
  file,
  allowedMimeTypes,
  maxFileSizeBytes,
}: UploadValidationInput): UploadValidationResult {
  const originalName = getSafeOriginalName(file.name);

  if (file.size === 0) {
    throw new UploadValidationError("Uploaded file is empty.");
  }

  if (file.size > maxFileSizeBytes) {
    throw new UploadValidationError(`File is too large. Maximum size is ${Math.floor(maxFileSizeBytes / (1024 * 1024))} MB.`);
  }

  if (!originalName || originalName.length > MAX_ORIGINAL_FILE_NAME_LENGTH) {
    throw new UploadValidationError("File name is missing or too long.");
  }

  const extension = path.extname(originalName).toLowerCase();
  if (!extension) {
    throw new UploadValidationError("File must include a valid extension.");
  }

  if (BLOCKED_EXTENSIONS.has(extension)) {
    throw new UploadValidationError("This file extension is not allowed.");
  }

  const mimeType = file.type || "application/octet-stream";
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new UploadValidationError("This file type is not allowed.");
  }

  const allowedExtensions = MIME_EXTENSION_MAP[mimeType] ?? [];
  if (!allowedExtensions.includes(extension)) {
    throw new UploadValidationError("File extension does not match the detected file type.");
  }

  return { mimeType, extension };
}
