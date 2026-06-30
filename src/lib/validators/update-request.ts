import { z } from "zod";
import type {
  UpdateRequestPriority,
  UpdateRequestStatus,
  UpdateRequestType,
} from "@/generated/prisma/client";
import {
  UPDATE_REQUEST_PRIORITY_VALUES,
  UPDATE_REQUEST_STATUS_VALUES,
  UPDATE_REQUEST_TYPE_VALUES,
} from "@/lib/update-requests/constants";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const optionalNullableString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? null : value ?? null));

export const updateRequestClientFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  requestType: z.enum(UPDATE_REQUEST_TYPE_VALUES, { message: "Request type is required" }),
  priority: z.enum(UPDATE_REQUEST_PRIORITY_VALUES).default("NORMAL"),
  description: z.string().trim().min(1, "Description is required").max(10000),
  projectId: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().optional(),
  ),
});

export const updateRequestAdminFormSchema = z.object({
  clientId: z.string().trim().min(1, "Client is required"),
  projectId: optionalString,
  title: z.string().trim().min(1, "Title is required").max(200),
  requestType: z.enum(UPDATE_REQUEST_TYPE_VALUES, { message: "Request type is required" }),
  priority: z.enum(UPDATE_REQUEST_PRIORITY_VALUES).default("NORMAL"),
  status: z.enum(UPDATE_REQUEST_STATUS_VALUES).default("SUBMITTED"),
  description: z.string().trim().min(1, "Description is required").max(10000),
  adminNotes: optionalNullableString,
  clientVisibleResponse: optionalNullableString,
  estimatedPrice: optionalNullableString,
  approvedPrice: optionalNullableString,
  dueDate: optionalString,
});

export const updateRequestAttachmentLinkSchema = z.object({
  externalUrl: z.string().trim().url("Enter a valid URL"),
  fileName: optionalString,
  notes: optionalNullableString,
});

export type UpdateRequestClientFormInput = z.infer<typeof updateRequestClientFormSchema>;
export type UpdateRequestAdminFormInput = z.infer<typeof updateRequestAdminFormSchema>;

export function parseUpdateRequestDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid due date");
  }
  return parsed;
}

export function applyUpdateRequestStatusFields(
  status: UpdateRequestStatus,
  existingCompletedAt?: Date | null,
) {
  if (status === "COMPLETED") {
    return { completedAt: existingCompletedAt ?? new Date() };
  }

  return { completedAt: null };
}

export function updateRequestClientInputToDbFields(input: UpdateRequestClientFormInput) {
  return {
    title: input.title,
    requestType: input.requestType as UpdateRequestType,
    priority: input.priority as UpdateRequestPriority,
    description: input.description,
    projectId: input.projectId ?? null,
    status: "SUBMITTED" as UpdateRequestStatus,
  };
}

export function updateRequestAdminInputToDbFields(input: UpdateRequestAdminFormInput) {
  const status = input.status as UpdateRequestStatus;

  return {
    clientId: input.clientId,
    projectId: input.projectId ?? null,
    title: input.title,
    requestType: input.requestType as UpdateRequestType,
    priority: input.priority as UpdateRequestPriority,
    status,
    description: input.description,
    adminNotes: input.adminNotes,
    clientVisibleResponse: input.clientVisibleResponse,
    estimatedPrice: input.estimatedPrice,
    approvedPrice: input.approvedPrice,
    dueDate: parseUpdateRequestDate(input.dueDate),
    ...applyUpdateRequestStatusFields(status),
  };
}
