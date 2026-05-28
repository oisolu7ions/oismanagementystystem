import { z } from "zod";
import type { ProjectStatus, ServiceType } from "@/generated/prisma/client";
import {
  PROJECT_STATUS_VALUES,
  SERVICE_TYPE_VALUES,
} from "@/lib/projects/constants";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  clientId: z.string().trim().min(1, "Client is required"),
  packageId: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().optional(),
  ),
  serviceType: z.enum(SERVICE_TYPE_VALUES, { message: "Service type is required" }),
  description: optionalString,
  status: z.enum(PROJECT_STATUS_VALUES, { message: "Status is required" }),
  startDate: optionalString,
  dueDate: optionalString,
  price: optionalString,
  monthlyFee: optionalString,
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

export function parseProjectDate(value?: string): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function projectInputToDbFields(input: ProjectFormInput) {
  return {
    name: input.name,
    clientId: input.clientId,
    packageId: input.packageId ?? null,
    serviceType: input.serviceType as ServiceType,
    description: input.description ?? null,
    status: input.status as ProjectStatus,
    startDate: parseProjectDate(input.startDate),
    dueDate: parseProjectDate(input.dueDate),
    price: input.price ?? null,
    monthlyFee: input.monthlyFee ?? null,
  };
}
