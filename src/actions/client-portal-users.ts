"use server";

import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/auth/password";
import { requireSession } from "@/lib/auth/session";
import {
  getSecurityRequestInfo,
  logClientSecurityEvent,
} from "@/lib/client-security/security-events";
import { sendVerificationEmailForClientUser } from "@/lib/client-security/client-auth-service";
import { prisma } from "@/lib/prisma";
import { getPortalDefaultSettings } from "@/lib/settings";
import { clientUserFormSchema, clientUserPasswordResetSchema } from "@/lib/validators/client-user";

export type ClientUserActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  message?: string;
};

function formatZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): ClientUserActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

function revalidateClientUserPaths(clientId: string) {
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function getClientUsersByClientId(clientId: string) {
  return prisma.clientUser.findMany({
    where: { clientId },
    include: {
      securityEvents: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}

export async function getClientPortalAccessSummary(clientId: string) {
  const users = await prisma.clientUser.findMany({
    where: { clientId },
    select: { id: true, isActive: true, emailVerifiedAt: true },
  });

  return {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.isActive).length,
    verifiedUsers: users.filter((user) => user.emailVerifiedAt).length,
    hasPortalAccess: users.some((user) => user.isActive),
  };
}

export async function createClientUserAction(
  clientId: string,
  _prevState: ClientUserActionState,
  formData: FormData,
): Promise<ClientUserActionState> {
  await requireSession();
  const requestInfo = await getSecurityRequestInfo();
  const parsed = clientUserFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  if (!parsed.data.password) {
    return { fieldErrors: { password: "Password is required" } };
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return { error: "Client not found" };
  }

  const existing = await prisma.clientUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existing) {
    return { fieldErrors: { email: "A portal user with this email already exists" } };
  }

  const defaults = await getPortalDefaultSettings();

  const clientUser = await prisma.clientUser.create({
    data: {
      clientId,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      isActive: defaults.defaultUserActive,
      emailVerifiedAt: defaults.requireEmailVerificationForNewUsers ? null : new Date(),
    },
  });

  await logClientSecurityEvent({
    clientUserId: clientUser.id,
    type: "CLIENT_USER_CREATED",
    message: "Client portal user created by admin.",
    requestInfo,
  });

  if (!defaults.autoSendWelcomeEmail || !defaults.requireEmailVerificationForNewUsers) {
    revalidateClientUserPaths(clientId);
    return {
      success: true,
      message: defaults.requireEmailVerificationForNewUsers
        ? "Portal user created. Welcome email was not sent by current settings."
        : "Portal user created and marked verified by current settings.",
    };
  }

  try {
    const { deliveryMode } = await sendVerificationEmailForClientUser({
      clientUser,
      requestInfo,
      enforceRateLimit: false,
    });
    revalidateClientUserPaths(clientId);
    return {
      success: true,
      message: deliveryMode === "console"
        ? "Portal user created. Welcome email was logged to the development console."
        : "Portal user created and welcome email sent.",
    };
  } catch (error) {
    revalidateClientUserPaths(clientId);
    return {
      success: true,
      message: "Portal user created, but the welcome email could not be sent. Use resend verification after configuring email.",
      error: error instanceof Error ? error.message : "Email delivery failed",
    };
  }
}

export async function resendClientUserVerificationAction(
  clientUserId: string,
): Promise<ClientUserActionState> {
  await requireSession();
  const requestInfo = await getSecurityRequestInfo();
  const clientUser = await prisma.clientUser.findUnique({ where: { id: clientUserId } });

  if (!clientUser) {
    return { error: "Portal user not found" };
  }

  if (clientUser.emailVerifiedAt) {
    return { success: true, message: "This user is already verified." };
  }

  try {
    const { deliveryMode } = await sendVerificationEmailForClientUser({
      clientUser,
      requestInfo,
      enforceRateLimit: true,
    });
    revalidateClientUserPaths(clientUser.clientId);
    return {
      success: true,
      message: deliveryMode === "console"
        ? "Verification email was logged to the development console."
        : "Verification email sent.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to send verification email.",
    };
  }
}

export async function setClientUserActiveAction(
  clientUserId: string,
  isActive: boolean,
): Promise<ClientUserActionState> {
  await requireSession();
  const clientUser = await prisma.clientUser.findUnique({
    where: { id: clientUserId },
  });

  if (!clientUser) {
    return { error: "Portal user not found" };
  }

  await prisma.clientUser.update({
    where: { id: clientUserId },
    data: { isActive },
  });

  revalidateClientUserPaths(clientUser.clientId);
  return { success: true };
}

export async function resetClientUserPasswordAction(
  clientUserId: string,
  _prevState: ClientUserActionState,
  formData: FormData,
): Promise<ClientUserActionState> {
  const admin = await requireSession();
  const requestInfo = await getSecurityRequestInfo();

  const parsed = clientUserPasswordResetSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const clientUser = await prisma.clientUser.findUnique({
    where: { id: clientUserId },
  });

  if (!clientUser) {
    return { error: "Portal user not found" };
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.clientUser.update({
      where: { id: clientUserId },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    }),
    prisma.clientPortalSession.updateMany({
      where: { clientUserId, revokedAt: null },
      data: { revokedAt: now },
    }),
    prisma.clientLoginCode.updateMany({
      where: { clientUserId, usedAt: null },
      data: { usedAt: now },
    }),
  ]);

  await logClientSecurityEvent({
    userId: admin.userId,
    clientUserId: clientUser.id,
    type: "CLIENT_PASSWORD_RESET_BY_ADMIN",
    message: `Admin reset password for client portal user ${clientUser.email}.`,
    requestInfo,
    metadata: { clientUserId: clientUser.id, clientId: clientUser.clientId },
  });

  revalidateClientUserPaths(clientUser.clientId);
  return {
    success: true,
    message: "Password reset. The client must sign in again with the new password.",
  };
}
