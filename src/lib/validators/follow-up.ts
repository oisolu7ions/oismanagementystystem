import { z } from "zod";
import type { FollowUpReason, FollowUpStatus } from "@/generated/prisma/client";
import {
  FOLLOW_UP_REASON_VALUES,
  FOLLOW_UP_STATUS_VALUES,
} from "@/lib/follow-ups/constants";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const followUpFormSchema = z
  .object({
    reason: z.enum(FOLLOW_UP_REASON_VALUES, { message: "Reason is required" }),
    followUpDate: z.string().trim().min(1, "Follow-up date is required"),
    status: z.enum(FOLLOW_UP_STATUS_VALUES, { message: "Status is required" }),
    notes: optionalString,
    leadId: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z.string().optional(),
    ),
    clientId: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z.string().optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (!data.leadId && !data.clientId) {
      ctx.addIssue({
        code: "custom",
        message: "Select a lead or a client",
        path: ["leadId"],
      });
    }
  });

export type FollowUpFormInput = z.infer<typeof followUpFormSchema>;

export function parseFollowUpDate(value: string): Date {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid follow-up date");
  }
  return parsed;
}

export function followUpInputToDbFields(input: FollowUpFormInput) {
  const status = input.status as FollowUpStatus;

  return {
    reason: input.reason as FollowUpReason,
    followUpDate: parseFollowUpDate(input.followUpDate),
    status,
    notes: input.notes ?? null,
    leadId: input.leadId ?? null,
    clientId: input.clientId ?? null,
    completedAt: status === "COMPLETED" ? new Date() : null,
  };
}
