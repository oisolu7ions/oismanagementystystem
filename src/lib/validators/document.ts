import { z } from "zod";
import type { DocumentFileType } from "@/generated/prisma/client";
import { DOCUMENT_FILE_TYPE_VALUES } from "@/lib/documents/constants";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const documentUrl = z
  .string()
  .trim()
  .min(1, "URL is required")
  .transform((value) => (value.startsWith("http") ? value : `https://${value}`))
  .pipe(z.url("Enter a valid document URL (include https://)"));

export const documentFormSchema = z
  .object({
    name: z.string().trim().min(1, "Document name is required"),
    fileType: z.enum(DOCUMENT_FILE_TYPE_VALUES, { message: "File type is required" }),
    url: documentUrl,
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
  });

export type DocumentFormInput = z.infer<typeof documentFormSchema>;

export function documentInputToDbFields(input: DocumentFormInput) {
  return {
    name: input.name,
    fileType: input.fileType as DocumentFileType,
    url: input.url,
    notes: input.notes ?? null,
    clientId: input.clientId ?? null,
    projectId: input.projectId ?? null,
  };
}
