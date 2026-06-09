export const DOCUMENT_SOURCE_TYPE_VALUES = ["LINK", "FILE"] as const;
export type DocumentSourceTypeValue = (typeof DOCUMENT_SOURCE_TYPE_VALUES)[number];

export const DOCUMENT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/zip",
] as const;

const MIME_TYPE_ACCEPT_MAP: Record<string, string> = {
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
  "image/jpeg": ".jpg,.jpeg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "application/zip": ".zip",
};

export const DOCUMENT_FILE_TYPE_VALUES = [
  "CONTRACT",
  "PROPOSAL",
  "INVOICE",
  "LOGO",
  "BRANDING",
  "IMAGES",
  "WEBSITE_COPY",
  "ACCESS_CREDENTIALS",
  "MEETING_NOTES",
  "PROJECT_BRIEF",
  "LEGAL_DOCUMENT",
  "OTHER",
] as const;

export type DocumentFileTypeValue = (typeof DOCUMENT_FILE_TYPE_VALUES)[number];

const FILE_TYPE_MIME_MAP: Record<DocumentFileTypeValue, readonly string[]> = {
  CONTRACT: [...DOCUMENT_MIME_TYPES],
  PROPOSAL: [...DOCUMENT_MIME_TYPES],
  INVOICE: [
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
    "image/webp",
  ],
  LOGO: [...IMAGE_MIME_TYPES],
  BRANDING: [...IMAGE_MIME_TYPES, "application/pdf", "application/zip"],
  IMAGES: [...IMAGE_MIME_TYPES, "application/zip"],
  WEBSITE_COPY: [
    "text/plain",
    "text/markdown",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ACCESS_CREDENTIALS: [],
  MEETING_NOTES: [
    "text/plain",
    "text/markdown",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  PROJECT_BRIEF: [...DOCUMENT_MIME_TYPES],
  LEGAL_DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  OTHER: [...DOCUMENT_MIME_TYPES, ...IMAGE_MIME_TYPES],
};

export const documentFileTypeOptions: {
  value: DocumentFileTypeValue;
  label: string;
}[] = [
  { value: "CONTRACT", label: "Contract" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "INVOICE", label: "Invoice" },
  { value: "LOGO", label: "Logo" },
  { value: "BRANDING", label: "Branding" },
  { value: "IMAGES", label: "Images" },
  { value: "WEBSITE_COPY", label: "Website Copy" },
  { value: "ACCESS_CREDENTIALS", label: "Access Credentials" },
  { value: "MEETING_NOTES", label: "Meeting Notes" },
  { value: "PROJECT_BRIEF", label: "Project Brief" },
  { value: "LEGAL_DOCUMENT", label: "Legal Document" },
  { value: "OTHER", label: "Other" },
];

export function getDocumentFileTypeLabel(type: DocumentFileTypeValue | string): string {
  return documentFileTypeOptions.find((o) => o.value === type)?.label ?? type;
}

export function normalizeDocumentUrl(url: string): string {
  const trimmed = url.trim();
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

export function isLinkOnlyDocumentType(fileType: DocumentFileTypeValue): boolean {
  return fileType === "ACCESS_CREDENTIALS";
}

export function getAcceptedMimeTypesForFileType(
  fileType: DocumentFileTypeValue,
): string[] {
  return [...FILE_TYPE_MIME_MAP[fileType]];
}

export function getAcceptAttributeForFileType(fileType: DocumentFileTypeValue): string {
  const mimeTypes = getAcceptedMimeTypesForFileType(fileType);
  const extensions = mimeTypes
    .map((mimeType) => MIME_TYPE_ACCEPT_MAP[mimeType])
    .filter(Boolean);

  return [...mimeTypes, ...extensions].join(",");
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getDocumentFileUrl(documentId: string): string {
  return `/api/documents/${documentId}/file`;
}

export function fileTypesMatchingQuery(query: string): DocumentFileTypeValue[] {
  const lower = query.toLowerCase();
  return documentFileTypeOptions
    .filter((option) => option.label.toLowerCase().includes(lower))
    .map((option) => option.value);
}
