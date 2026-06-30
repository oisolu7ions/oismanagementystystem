import { z } from "zod";

export const booleanFormField = z.preprocess(
  (value) => value === "true" || value === true,
  z.boolean(),
);

export const optionalTextField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const projectSharingSchema = z.object({
  clientVisible: booleanFormField.optional().default(false),
  clientSummary: optionalTextField,
  clientStatusNote: optionalTextField,
});

export const taskSharingSchema = z.object({
  clientVisible: booleanFormField.optional().default(false),
  clientNote: optionalTextField,
});

export const invoiceSharingSchema = z.object({
  clientVisible: booleanFormField.optional().default(true),
  clientNote: optionalTextField,
});

export const documentSharingSchema = z.object({
  clientVisible: booleanFormField.optional().default(false),
  clientDescription: optionalTextField,
});

export const activitySharingSchema = z.object({
  clientVisible: booleanFormField,
  clientMessage: optionalTextField,
});
