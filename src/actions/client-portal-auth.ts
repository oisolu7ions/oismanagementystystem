"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  createClientLoginChallenge,
  createClientSession,
  deleteClientLoginChallenge,
  deleteClientSession,
  getClientLoginChallenge,
} from "@/lib/auth/client-session";
import {
  issueLoginCode,
  sendVerificationEmailForClientUser,
} from "@/lib/client-security/client-auth-service";
import {
  getSecurityRequestInfo,
  logClientSecurityEvent,
} from "@/lib/client-security/security-events";
import { hashToken } from "@/lib/client-security/tokens";
import { getClientPortalSecuritySettings } from "@/lib/settings";
import {
  clientPortalCodeSchema,
  clientPortalEmailSchema,
  clientPortalLoginSchema,
} from "@/lib/validators/client-user";

export type ClientPortalAuthState = {
  error?: string;
  success?: string;
  email?: string;
  canResendVerification?: boolean;
};

export async function clientLoginAction(
  _prevState: ClientPortalAuthState,
  formData: FormData,
): Promise<ClientPortalAuthState> {
  const requestInfo = await getSecurityRequestInfo();
  const security = await getClientPortalSecuritySettings();
  const parsed = clientPortalLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const clientUser = await prisma.clientUser.findUnique({
    where: { email },
    include: {
      client: { select: { id: true, name: true, status: true } },
    },
  });

  if (!clientUser || !clientUser.isActive) {
    return { error: "Invalid email or password" };
  }

  if (clientUser.client.status === "INACTIVE" || clientUser.client.status === "PAST_CLIENT") {
    return { error: "Portal access is not available for this account." };
  }

  const valid = await verifyPassword(parsed.data.password, clientUser.passwordHash);
  if (!valid) {
    await logClientSecurityEvent({
      clientUserId: clientUser.id,
      type: "LOGIN_PASSWORD_FAILED",
      message: "Password login failed.",
      requestInfo,
    });
    return { error: "Invalid email or password" };
  }

  await logClientSecurityEvent({
    clientUserId: clientUser.id,
    type: "LOGIN_PASSWORD_SUCCESS",
    message: "Password accepted for client portal login.",
    requestInfo,
  });

  if (security.requireEmailVerification && !clientUser.emailVerifiedAt) {
    await logClientSecurityEvent({
      clientUserId: clientUser.id,
      type: "LOGIN_BLOCKED_UNVERIFIED_EMAIL",
      message: "Login blocked because email is not verified.",
      requestInfo,
    });
    return {
      error: "Please verify your email before logging in.",
      canResendVerification: true,
      email,
    };
  }

  if (!security.requireLoginCode) {
    await prisma.clientUser.update({
      where: { id: clientUser.id },
      data: { lastLoginAt: new Date() },
    });
    await logClientSecurityEvent({
      clientUserId: clientUser.id,
      type: "LOGIN_SUCCESS",
      message: "Client portal login completed without one-time code.",
      requestInfo,
    });
    await createClientSession({
      clientUserId: clientUser.id,
      clientId: clientUser.clientId,
      email: clientUser.email,
      name: clientUser.name,
    });
    await deleteClientLoginChallenge();
    redirect("/client/dashboard");
  }

  try {
    const { codeId } = await issueLoginCode({ clientUser, requestInfo, enforceRateLimit: false });
    await createClientLoginChallenge({
      clientUserId: clientUser.id,
      clientId: clientUser.clientId,
      email: clientUser.email,
      name: clientUser.name,
      codeId,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to send login code.",
    };
  }

  redirect("/client/login/code");
}

export async function clientVerifyLoginCodeAction(
  _prevState: ClientPortalAuthState,
  formData: FormData,
): Promise<ClientPortalAuthState> {
  const requestInfo = await getSecurityRequestInfo();
  const security = await getClientPortalSecuritySettings();
  const challenge = await getClientLoginChallenge();
  if (!challenge) {
    return { error: "Your login code session expired. Please sign in again." };
  }

  const parsed = clientPortalCodeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid code" };
  }

  const loginCode = await prisma.clientLoginCode.findFirst({
    where: {
      id: challenge.codeId,
      clientUserId: challenge.clientUserId,
    },
    include: {
      clientUser: {
        include: { client: { select: { status: true } } },
      },
    },
  });

  if (!loginCode || loginCode.usedAt) {
    await logClientSecurityEvent({
      clientUserId: challenge.clientUserId,
      type: "LOGIN_CODE_FAILED",
      message: "Login code was missing or already used.",
      requestInfo,
    });
    return { error: "Invalid or expired code. Please request a new code." };
  }

  if (loginCode.expiresAt < new Date()) {
    await prisma.clientLoginCode.update({
      where: { id: loginCode.id },
      data: { usedAt: new Date() },
    });
    await logClientSecurityEvent({
      clientUserId: challenge.clientUserId,
      type: "LOGIN_CODE_EXPIRED",
      message: "Login code expired before use.",
      requestInfo,
    });
    return { error: "That code expired. Please request a new code." };
  }

  if (loginCode.attempts >= security.maxLoginCodeAttempts) {
    await prisma.clientLoginCode.update({
      where: { id: loginCode.id },
      data: { usedAt: new Date() },
    });
    await logClientSecurityEvent({
      clientUserId: challenge.clientUserId,
      type: "LOGIN_CODE_FAILED",
      message: "Login code attempt limit reached.",
      requestInfo,
    });
    return { error: "Too many attempts. Please request a new code." };
  }

  const submittedHash = hashToken(parsed.data.code);
  if (submittedHash !== loginCode.codeHash) {
    const attempts = loginCode.attempts + 1;
    await prisma.clientLoginCode.update({
      where: { id: loginCode.id },
      data: {
        attempts,
        usedAt: attempts >= security.maxLoginCodeAttempts ? new Date() : undefined,
      },
    });
    await logClientSecurityEvent({
      clientUserId: challenge.clientUserId,
      type: "LOGIN_CODE_FAILED",
      message: "Incorrect login code submitted.",
      requestInfo,
    });
    return {
      error: attempts >= security.maxLoginCodeAttempts
        ? "Too many attempts. Please request a new code."
        : "Incorrect code. Please try again.",
    };
  }

  if (!loginCode.clientUser.isActive || (security.requireEmailVerification && !loginCode.clientUser.emailVerifiedAt)) {
    return { error: "Portal access is not available for this account." };
  }

  if (loginCode.clientUser.client.status === "INACTIVE" || loginCode.clientUser.client.status === "PAST_CLIENT") {
    return { error: "Portal access is not available for this account." };
  }

  await prisma.$transaction([
    prisma.clientLoginCode.update({
      where: { id: loginCode.id },
      data: { usedAt: new Date(), attempts: loginCode.attempts + 1 },
    }),
    prisma.clientUser.update({
      where: { id: loginCode.clientUserId },
      data: { lastLoginAt: new Date() },
    }),
  ]);

  await logClientSecurityEvent({
    clientUserId: challenge.clientUserId,
    type: "LOGIN_CODE_SUCCESS",
    message: "Login code accepted.",
    requestInfo,
  });
  await logClientSecurityEvent({
    clientUserId: challenge.clientUserId,
    type: "LOGIN_SUCCESS",
    message: "Client portal login completed.",
    requestInfo,
  });

  await createClientSession({
    clientUserId: challenge.clientUserId,
    clientId: challenge.clientId,
    email: challenge.email,
    name: challenge.name,
  });
  await deleteClientLoginChallenge();

  redirect("/client/dashboard");
}

export async function resendClientLoginCodeAction(): Promise<ClientPortalAuthState> {
  const requestInfo = await getSecurityRequestInfo();
  const security = await getClientPortalSecuritySettings();
  const challenge = await getClientLoginChallenge();
  if (!challenge) {
    return { error: "Your login code session expired. Please sign in again." };
  }

  const clientUser = await prisma.clientUser.findUnique({
    where: { id: challenge.clientUserId },
  });
  if (!clientUser || !clientUser.isActive || (security.requireEmailVerification && !clientUser.emailVerifiedAt)) {
    return { error: "Unable to send a new code for this account." };
  }

  try {
    const { deliveryMode, codeId } = await issueLoginCode({ clientUser, requestInfo });
    await createClientLoginChallenge({ ...challenge, codeId });
    return {
      success: deliveryMode === "disabled"
        ? "Email delivery is disabled. Ask the OIS team for help."
        : deliveryMode === "console"
          ? "A new login code was logged to the development console."
          : "A new login code was sent to your email.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to send a new code.",
    };
  }
}

export async function resendVerificationEmailAction(
  _prevState: ClientPortalAuthState,
  formData: FormData,
): Promise<ClientPortalAuthState> {
  const requestInfo = await getSecurityRequestInfo();
  const parsed = clientPortalEmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address" };
  }

  const email = parsed.data.email.toLowerCase();
  const clientUser = await prisma.clientUser.findUnique({ where: { email } });
  if (!clientUser) {
    return { success: "If that account exists, a verification email will be sent." };
  }

  if (clientUser.emailVerifiedAt) {
    return { success: "This email is already verified. You can sign in." };
  }

  try {
    const { deliveryMode } = await sendVerificationEmailForClientUser({
      clientUser,
      requestInfo,
      enforceRateLimit: true,
    });
    return {
      success: deliveryMode === "disabled"
        ? "Email delivery is disabled. Ask the OIS team for help."
        : deliveryMode === "console"
          ? "Verification email was logged to the development console."
          : "Verification email sent. Please check your inbox.",
      email,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to send verification email.",
      email,
    };
  }
}

export async function verifyClientEmailToken(token: string): Promise<
  | { status: "success"; message: string }
  | { status: "error"; message: string }
> {
  const requestInfo = await getSecurityRequestInfo();
  const tokenHash = hashToken(token);
  const verificationToken = await prisma.clientEmailVerificationToken.findUnique({
    where: { tokenHash },
    include: { clientUser: true },
  });

  if (!verificationToken) {
    await logClientSecurityEvent({
      type: "VERIFICATION_FAILED",
      message: "Email verification failed because token was not found.",
      requestInfo,
    });
    return { status: "error", message: "This verification link is invalid." };
  }

  if (verificationToken.usedAt) {
    return { status: "error", message: "This verification link has already been used." };
  }

  if (verificationToken.expiresAt < new Date()) {
    await logClientSecurityEvent({
      clientUserId: verificationToken.clientUserId,
      type: "VERIFICATION_FAILED",
      message: "Email verification failed because token expired.",
      requestInfo,
    });
    return { status: "error", message: "This verification link has expired." };
  }

  await prisma.$transaction([
    prisma.clientUser.update({
      where: { id: verificationToken.clientUserId },
      data: { emailVerifiedAt: verificationToken.clientUser.emailVerifiedAt ?? new Date() },
    }),
    prisma.clientEmailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await logClientSecurityEvent({
    clientUserId: verificationToken.clientUserId,
    type: "EMAIL_VERIFIED",
    message: "Client email verified successfully.",
    requestInfo,
  });

  return { status: "success", message: "Your email is verified. You can now sign in." };
}

export async function clientLogoutAction(): Promise<void> {
  const session = await import("@/lib/auth/client-session").then((mod) => mod.getClientSession());
  if (session) {
    await logClientSecurityEvent({
      clientUserId: session.clientUserId,
      type: "LOGOUT",
      message: "Client portal user logged out.",
      requestInfo: await getSecurityRequestInfo(),
    });
  }
  await deleteClientSession();
  await deleteClientLoginChallenge();
  redirect("/client/login");
}
