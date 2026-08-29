"use server";

import { redirect, RedirectType } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  createAdminMfaChallenge,
  deleteAdminMfaChallenge,
  getAdminMfaChallenge,
} from "@/lib/auth/admin-mfa-challenge";
import { createSession, requireSession } from "@/lib/auth/session";
import {
  createTotpEnrollment,
  decryptTotpSecret,
  encryptTotpSecret,
  verifyTotpCode,
} from "@/lib/auth/totp";
import { getSecurityRequestInfo, logClientSecurityEvent } from "@/lib/client-security/security-events";
import {
  consumeRateLimit,
  getIpRateLimitKey,
  rateLimitMessage,
} from "@/lib/security/rate-limit";
import { adminMfaCodeSchema, adminMfaDisableSchema } from "@/lib/validators/auth";

export type AdminMfaActionState = {
  error?: string;
  success?: string;
  otpauthUrl?: string;
  qrDataUrl?: string;
  manualSecret?: string;
};

const ADMIN_MFA_WINDOW_SECONDS = 15 * 60;
const ADMIN_MFA_IP_LIMIT = 20;
const ADMIN_MFA_USER_LIMIT = 10;

async function checkMfaRateLimit(userId: string, scope: "login" | "settings") {
  const requestInfo = await getSecurityRequestInfo();
  const ipLimit = await consumeRateLimit({
    scope: `admin-mfa-${scope}-ip`,
    key: getIpRateLimitKey(requestInfo),
    limit: ADMIN_MFA_IP_LIMIT,
    windowSeconds: ADMIN_MFA_WINDOW_SECONDS,
  });

  if (ipLimit.limited) {
    await logClientSecurityEvent({
      userId,
      type: "RATE_LIMITED",
      message: `Admin MFA ${scope} IP rate limit reached.`,
      requestInfo,
    });
    return rateLimitMessage(ipLimit.retryAfterSeconds);
  }

  const userLimit = await consumeRateLimit({
    scope: `admin-mfa-${scope}-user`,
    key: userId,
    limit: ADMIN_MFA_USER_LIMIT,
    windowSeconds: ADMIN_MFA_WINDOW_SECONDS,
  });

  if (userLimit.limited) {
    await logClientSecurityEvent({
      userId,
      type: "RATE_LIMITED",
      message: `Admin MFA ${scope} user rate limit reached.`,
      requestInfo,
    });
    return rateLimitMessage(userLimit.retryAfterSeconds);
  }

  return null;
}

export async function verifyAdminLoginMfaAction(
  _prevState: AdminMfaActionState,
  formData: FormData,
): Promise<AdminMfaActionState> {
  const parsed = adminMfaCodeSchema.safeParse({
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid code" };
  }

  const challenge = await getAdminMfaChallenge();
  if (!challenge) {
    return { error: "Your sign-in session expired. Please sign in again." };
  }

  const rateLimitError = await checkMfaRateLimit(challenge.userId, "login");
  if (rateLimitError) {
    return { error: rateLimitError };
  }

  const user = await prisma.user.findUnique({
    where: { id: challenge.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      totpEnabled: true,
      totpSecretEncrypted: true,
    },
  });

  const requestInfo = await getSecurityRequestInfo();

  if (
    !user ||
    !user.totpEnabled ||
    !user.totpSecretEncrypted ||
    user.email !== challenge.email
  ) {
    await deleteAdminMfaChallenge();
    return { error: "Your sign-in session expired. Please sign in again." };
  }

  let secret: string;
  try {
    secret = decryptTotpSecret(user.totpSecretEncrypted);
  } catch {
    await deleteAdminMfaChallenge();
    return { error: "Unable to verify MFA. Contact support." };
  }

  if (!verifyTotpCode(secret, parsed.data.code)) {
    await logClientSecurityEvent({
      userId: user.id,
      type: "ADMIN_MFA_FAILED",
      message: "Admin MFA verification failed during login.",
      requestInfo,
    });
    return { error: "Invalid authentication code. Try again." };
  }

  await logClientSecurityEvent({
    userId: user.id,
    type: "ADMIN_MFA_SUCCESS",
    message: "Admin MFA verification succeeded.",
    requestInfo,
  });

  await logClientSecurityEvent({
    userId: user.id,
    type: "ADMIN_LOGIN_SUCCESS",
    message: "Admin login completed with MFA.",
    requestInfo,
  });

  await deleteAdminMfaChallenge();
  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect("/dashboard", RedirectType.replace);
}

export async function beginAdminMfaEnrollmentAction(): Promise<AdminMfaActionState> {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, totpEnabled: true },
  });

  if (!user) {
    return { error: "User not found." };
  }

  if (user.totpEnabled) {
    return { error: "Multi-factor authentication is already enabled." };
  }

  const { secret, otpauthUrl } = createTotpEnrollment(user.email);
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      totpSecretEncrypted: encryptTotpSecret(secret),
      totpEnabled: false,
      totpVerifiedAt: null,
    },
  });

  return {
    success: "Scan the QR code with your authenticator app, then enter a code to confirm.",
    otpauthUrl,
    qrDataUrl,
    manualSecret: secret,
  };
}

export async function confirmAdminMfaEnrollmentAction(
  _prevState: AdminMfaActionState,
  formData: FormData,
): Promise<AdminMfaActionState> {
  const session = await requireSession();
  const parsed = adminMfaCodeSchema.safeParse({
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid code" };
  }

  const rateLimitError = await checkMfaRateLimit(session.userId, "settings");
  if (rateLimitError) {
    return { error: rateLimitError };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      totpEnabled: true,
      totpSecretEncrypted: true,
    },
  });

  if (!user?.totpSecretEncrypted) {
    return { error: "Start MFA setup before confirming a code." };
  }

  if (user.totpEnabled) {
    return { error: "Multi-factor authentication is already enabled." };
  }

  let secret: string;
  try {
    secret = decryptTotpSecret(user.totpSecretEncrypted);
  } catch {
    return { error: "Unable to read MFA setup. Start again." };
  }

  if (!verifyTotpCode(secret, parsed.data.code)) {
    await logClientSecurityEvent({
      userId: user.id,
      type: "ADMIN_MFA_FAILED",
      message: "Admin MFA enrollment confirmation failed.",
      requestInfo: await getSecurityRequestInfo(),
    });
    return { error: "Invalid authentication code. Try again." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      totpEnabled: true,
      totpVerifiedAt: new Date(),
    },
  });

  await logClientSecurityEvent({
    userId: user.id,
    type: "ADMIN_MFA_ENROLLED",
    message: "Admin MFA enabled.",
    requestInfo: await getSecurityRequestInfo(),
  });

  return { success: "Multi-factor authentication is now enabled for your account." };
}

export async function cancelAdminMfaEnrollmentAction(): Promise<AdminMfaActionState> {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { totpEnabled: true },
  });

  if (!user) {
    return { error: "User not found." };
  }

  if (user.totpEnabled) {
    return { error: "Multi-factor authentication is already enabled." };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      totpSecretEncrypted: null,
      totpVerifiedAt: null,
    },
  });

  return { success: "MFA setup cancelled." };
}

export async function disableAdminMfaAction(
  _prevState: AdminMfaActionState,
  formData: FormData,
): Promise<AdminMfaActionState> {
  const session = await requireSession();
  const parsed = adminMfaDisableSchema.safeParse({
    password: formData.get("password"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const rateLimitError = await checkMfaRateLimit(session.userId, "settings");
  if (rateLimitError) {
    return { error: rateLimitError };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user?.totpEnabled || !user.totpSecretEncrypted) {
    return { error: "Multi-factor authentication is not enabled." };
  }

  const passwordValid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!passwordValid) {
    return { error: "Incorrect password." };
  }

  let secret: string;
  try {
    secret = decryptTotpSecret(user.totpSecretEncrypted);
  } catch {
    return { error: "Unable to verify MFA. Contact support." };
  }

  if (!verifyTotpCode(secret, parsed.data.code)) {
    await logClientSecurityEvent({
      userId: user.id,
      type: "ADMIN_MFA_FAILED",
      message: "Admin MFA disable attempt failed.",
      requestInfo: await getSecurityRequestInfo(),
    });
    return { error: "Invalid authentication code." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      totpEnabled: false,
      totpSecretEncrypted: null,
      totpVerifiedAt: null,
    },
  });

  await logClientSecurityEvent({
    userId: user.id,
    type: "ADMIN_MFA_DISABLED",
    message: "Admin MFA disabled.",
    requestInfo: await getSecurityRequestInfo(),
  });

  return { success: "Multi-factor authentication has been disabled." };
}

export async function getAdminMfaStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totpEnabled: true,
      totpVerifiedAt: true,
      totpSecretEncrypted: true,
    },
  });

  if (!user) {
    return { enabled: false, pendingSetup: false, verifiedAt: null as Date | null };
  }

  return {
    enabled: user.totpEnabled,
    pendingSetup: Boolean(user.totpSecretEncrypted && !user.totpEnabled),
    verifiedAt: user.totpVerifiedAt,
  };
}
