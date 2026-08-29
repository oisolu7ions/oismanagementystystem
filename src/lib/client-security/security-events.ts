import { headers } from "next/headers";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ClientSecurityEventType =
  | "CLIENT_USER_CREATED"
  | "VERIFICATION_EMAIL_SENT"
  | "EMAIL_VERIFIED"
  | "VERIFICATION_FAILED"
  | "LOGIN_PASSWORD_SUCCESS"
  | "LOGIN_PASSWORD_FAILED"
  | "LOGIN_CODE_SENT"
  | "LOGIN_CODE_SUCCESS"
  | "LOGIN_CODE_FAILED"
  | "LOGIN_CODE_EXPIRED"
  | "LOGIN_SUCCESS"
  | "LOGIN_BLOCKED_UNVERIFIED_EMAIL"
  | "LOGOUT"
  | "RATE_LIMITED"
  | "ADMIN_LOGIN_SUCCESS"
  | "ADMIN_LOGIN_FAILED"
  | "ADMIN_LOGIN_PASSWORD_SUCCESS"
  | "ADMIN_MFA_SUCCESS"
  | "ADMIN_MFA_FAILED"
  | "ADMIN_MFA_ENROLLED"
  | "ADMIN_MFA_DISABLED"
  | "ADMIN_SETTING_CHANGED"
  | "TEST_EMAIL_SENT"
  | "FILE_UPLOAD_ACCEPTED"
  | "FILE_UPLOAD_REJECTED"
  | "SESSION_REVOKED"
  | "SESSION_EXPIRED"
  | "CLIENT_PASSWORD_RESET_BY_ADMIN";

export type SecurityRequestInfo = {
  ipAddress?: string;
  userAgent?: string;
};

export async function getSecurityRequestInfo(): Promise<SecurityRequestInfo> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headerStore.get("x-real-ip")?.trim();

  return {
    ipAddress: forwardedFor || realIp || undefined,
    userAgent: headerStore.get("user-agent") ?? undefined,
  };
}

export async function logClientSecurityEvent({
  userId,
  clientUserId,
  type,
  message,
  requestInfo,
  metadata,
}: {
  userId?: string;
  clientUserId?: string;
  type: ClientSecurityEventType;
  message: string;
  requestInfo?: SecurityRequestInfo;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.securityEvent.create({
    data: {
      userId,
      clientUserId,
      type,
      message,
      metadata,
      ipAddress: requestInfo?.ipAddress,
      userAgent: requestInfo?.userAgent,
    },
  });
}
