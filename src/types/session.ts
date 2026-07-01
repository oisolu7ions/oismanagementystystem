import type { UserRole } from "@/generated/prisma/client";

export type SessionPayload = {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  role: UserRole;
};
