import { z } from "zod";
import type { ClientStatus } from "@/generated/prisma/client";
import { CLIENT_STATUS_VALUES } from "@/lib/clients/constants";

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

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  businessName: optionalString,
  email: optionalEmail,
  phone: optionalString,
  website: optionalString,
  address: optionalString,
  status: z.enum(CLIENT_STATUS_VALUES, { message: "Status is required" }),
  packageId: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().optional(),
  ),
  monthlyPlan: optionalString,
  monthlyAmount: optionalString,
  notes: optionalString,
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;

export function clientInputToDbFields(input: ClientFormInput) {
  return {
    name: input.name,
    businessName: input.businessName ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    website: input.website ?? null,
    address: input.address ?? null,
    status: input.status as ClientStatus,
    packageId: input.packageId ?? null,
    monthlyPlan: input.monthlyPlan ?? null,
    monthlyAmount: input.monthlyAmount ?? null,
    notes: input.notes ?? null,
  };
}
