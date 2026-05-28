import { z } from "zod";

function parseFeatures(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export const packageFormSchema = z.object({
  name: z.string().trim().min(1, "Package name is required"),
  setupPrice: z.string().trim().min(1, "Setup price is required"),
  monthlyPrice: z.string().trim().min(1, "Monthly price is required"),
  description: z.string().trim().optional(),
  features: z.string().optional(),
  isActive: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((value) => value === true || value === "true"),
});

export type PackageFormInput = z.infer<typeof packageFormSchema>;

export function parsePackageFormData(formData: FormData): PackageFormInput {
  return packageFormSchema.parse({
    name: formData.get("name"),
    setupPrice: formData.get("setupPrice"),
    monthlyPrice: formData.get("monthlyPrice"),
    description: formData.get("description") ?? undefined,
    features: formData.get("features") ?? undefined,
    isActive: formData.get("isActive") ?? "true",
  });
}

export function packageInputToDbFields(input: PackageFormInput) {
  return {
    name: input.name,
    setupPrice: input.setupPrice,
    monthlyPrice: input.monthlyPrice,
    description: input.description || null,
    features: parseFeatures(input.features),
    isActive: input.isActive,
  };
}

export function featuresToFormValue(features: string[]): string {
  return features.join("\n");
}
