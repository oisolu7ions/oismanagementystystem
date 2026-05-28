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

export function fileTypesMatchingQuery(query: string): DocumentFileTypeValue[] {
  const lower = query.toLowerCase();
  return documentFileTypeOptions
    .filter((option) => option.label.toLowerCase().includes(lower))
    .map((option) => option.value);
}
