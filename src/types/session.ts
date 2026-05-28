import type { UserRole } from "@/generated/prisma/client";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
};
