import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const adminMfaCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Enter the 6-digit code from your authenticator app")
    .max(8, "Enter a valid authenticator code"),
});

export const adminMfaDisableSchema = z.object({
  password: z.string().min(1, "Password is required"),
  code: adminMfaCodeSchema.shape.code,
});

export type LoginInput = z.infer<typeof loginSchema>;
