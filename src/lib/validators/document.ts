import { z } from "zod";
import type { DocumentFileType, DocumentSourceType } from "@/generated/prisma/client";
import {
  DOCUMENT_FILE_TYPE_VALUES,
  DOCUMENT_SOURCE_TYPE_VALUES,
  isLinkOnlyDocumentType,
} from "@/lib/documents/constants";
import { documentSharingSchema } from "@/lib/validators/client-sharing";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const documentUrl = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(
    z
      .string({ message: "URL is required" })
      .transform((value) => (value.startsWith("http") ? value : `https://${value}`))
      .pipe(z.url("Enter a valid document URL (include https://)")),
  );

export const documentFormSchema = documentSharingSchema
  .extend({
    name: z.string().trim().min(1, "Document name is required"),
    fileType: z.enum(DOCUMENT_FILE_TYPE_VALUES, { message: "File type is required" }),
    sourceType: z.enum(DOCUMENT_SOURCE_TYPE_VALUES, { message: "Source type is required" }),
    url: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    notes: optionalString,
    clientId: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z.string().optional(),
    ),
    projectId: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z.string().optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (!data.clientId && !data.projectId) {
      ctx.addIssue({
        code: "custom",
        message: "Select a client or a project",
        path: ["clientId"],
      });
    }

    const effectiveSourceType = isLinkOnlyDocumentType(data.fileType) ? "LINK" : data.sourceType;

    if (effectiveSourceType === "LINK") {
      const urlResult = documentUrl.safeParse(data.url ?? "");
      if (!urlResult.success) {
        ctx.addIssue({
          code: "custom",
          message: urlResult.error.issues[0]?.message ?? "URL is required",
          path: ["url"],
        });
      }
    }
  });

export type DocumentFormInput = z.infer<typeof documentFormSchema>;

export function documentInputToDbFields(
  input: DocumentFormInput,
  fileFields?: {
    storedFileName: string;
    originalFileName: string;
    mimeType: string;
    fileSize: number;
  } | null,
) {
  const effectiveSourceType = isLinkOnlyDocumentType(input.fileType)
    ? "LINK"
    : input.sourceType;

  if (effectiveSourceType === "LINK") {
    const urlResult = documentUrl.safeParse(input.url ?? "");
    return {
      name: input.name,
      fileType: input.fileType as DocumentFileType,
      sourceType: "LINK" as DocumentSourceType,
      url: urlResult.success ? urlResult.data : null,
      storedFileName: null,
      originalFileName: null,
      mimeType: null,
      fileSize: null,
      notes: input.notes ?? null,
      clientId: input.clientId ?? null,
      projectId: input.projectId ?? null,
      clientVisible: input.clientVisible ?? false,
      clientDescription: input.clientDescription ?? null,
    };
  }

  return {
    name: input.name,
    fileType: input.fileType as DocumentFileType,
    sourceType: "FILE" as DocumentSourceType,
    url: null,
    storedFileName: fileFields?.storedFileName ?? null,
    originalFileName: fileFields?.originalFileName ?? null,
    mimeType: fileFields?.mimeType ?? null,
    fileSize: fileFields?.fileSize ?? null,
    notes: input.notes ?? null,
    clientId: input.clientId ?? null,
    projectId: input.projectId ?? null,
    clientVisible: input.clientVisible ?? false,
    clientDescription: input.clientDescription ?? null,
  };
}
