"use server";

import { redirect, RedirectType } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminMfaChallenge } from "@/lib/auth/admin-mfa-challenge";
import { createSession, deleteSession } from "@/lib/auth/session";
import { getSecurityRequestInfo, logClientSecurityEvent } from "@/lib/client-security/security-events";
import {
  consumeRateLimit,
  getIpRateLimitKey,
  rateLimitMessage,
} from "@/lib/security/rate-limit";
import { loginSchema } from "@/lib/validators/auth";

export type AuthActionState = {
  error?: string;
};

const ADMIN_LOGIN_WINDOW_SECONDS = 15 * 60;
const ADMIN_LOGIN_IP_LIMIT = 20;
const ADMIN_LOGIN_EMAIL_LIMIT = 8;

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const requestInfo = await getSecurityRequestInfo();
  const ipLimit = await consumeRateLimit({
    scope: "admin-login-ip",
    key: getIpRateLimitKey(requestInfo),
    limit: ADMIN_LOGIN_IP_LIMIT,
    windowSeconds: ADMIN_LOGIN_WINDOW_SECONDS,
  });

  if (ipLimit.limited) {
    await logClientSecurityEvent({
      type: "RATE_LIMITED",
      message: "Admin login IP rate limit reached.",
      requestInfo,
    });
    return { error: rateLimitMessage(ipLimit.retryAfterSeconds) };
  }

  const emailLimit = await consumeRateLimit({
    scope: "admin-login-email",
    key: email,
    limit: ADMIN_LOGIN_EMAIL_LIMIT,
    windowSeconds: ADMIN_LOGIN_WINDOW_SECONDS,
  });

  if (emailLimit.limited) {
    await logClientSecurityEvent({
      type: "RATE_LIMITED",
      message: "Admin login email rate limit reached.",
      requestInfo,
    });
    return { error: rateLimitMessage(emailLimit.retryAfterSeconds) };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      totpEnabled: true,
      totpSecretEncrypted: true,
    },
  });

  if (!user) {
    await logClientSecurityEvent({
      type: "ADMIN_LOGIN_FAILED",
      message: "Admin login failed for unknown email.",
      requestInfo,
      metadata: { email },
    });
    return { error: "Invalid email or password" };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    await logClientSecurityEvent({
      userId: user.id,
      type: "ADMIN_LOGIN_FAILED",
      message: "Admin login failed because password was incorrect.",
      requestInfo,
    });
    return { error: "Invalid email or password" };
  }

  await logClientSecurityEvent({
    userId: user.id,
    type: "ADMIN_LOGIN_PASSWORD_SUCCESS",
    message: "Admin password verified.",
    requestInfo,
  });

  if (user.totpEnabled && user.totpSecretEncrypted) {
    await createAdminMfaChallenge({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    redirect("/login/mfa", RedirectType.replace);
  }

  await logClientSecurityEvent({
    userId: user.id,
    type: "ADMIN_LOGIN_SUCCESS",
    message: "Admin login successful.",
    requestInfo,
  });

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect("/dashboard", RedirectType.replace);
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login", RedirectType.replace);
}
