import { z } from "zod";
import { LeadSource, LeadStatus } from "@/generated/prisma/client";
import { LEAD_SOURCE_VALUES, LEAD_STATUS_VALUES } from "@/lib/leads/constants";

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.union([z.undefined(), z.email("Enter a valid email address")]));

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const leadFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  businessName: optionalString,
  email: optionalEmail,
  phone: optionalString,
  website: optionalString,
  industry: optionalString,
  serviceInterest: optionalString,
  leadSource: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.enum(LEAD_SOURCE_VALUES).optional(),
  ),
  status: z.enum(LEAD_STATUS_VALUES, { message: "Status is required" }),
  notes: optionalString,
  followUpDate: optionalString,
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

export function parseFollowUpDate(value?: string): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function leadInputToDbFields(input: LeadFormInput) {
  return {
    name: input.name,
    businessName: input.businessName ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    website: input.website ?? null,
    industry: input.industry ?? null,
    serviceInterest: input.serviceInterest ?? null,
    leadSource: (input.leadSource as LeadSource | undefined) ?? null,
    status: input.status as LeadStatus,
    notes: input.notes ?? null,
    followUpDate: parseFollowUpDate(input.followUpDate),
  };
}
