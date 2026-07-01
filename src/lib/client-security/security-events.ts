import { headers } from "next/headers";
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
  | "ADMIN_SETTING_CHANGED"
  | "TEST_EMAIL_SENT";

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
  clientUserId,
  type,
  message,
  requestInfo,
}: {
  clientUserId?: string;
  type: ClientSecurityEventType;
  message: string;
  requestInfo?: SecurityRequestInfo;
}): Promise<void> {
  await prisma.securityEvent.create({
    data: {
      clientUserId,
      type,
      message,
      ipAddress: requestInfo?.ipAddress,
      userAgent: requestInfo?.userAgent,
    },
  });
}
