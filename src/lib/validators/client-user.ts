import { z } from "zod";

export const clientPortalLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const clientUserFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

export type ClientUserFormInput = z.infer<typeof clientUserFormSchema>;
