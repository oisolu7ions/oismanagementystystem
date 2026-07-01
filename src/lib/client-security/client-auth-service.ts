import { getAbsoluteUrl, sendEmail, type EmailDeliveryResult } from "@/lib/email/provider";
import { prisma } from "@/lib/prisma";
import {
  generateLoginCode,
  generateVerificationToken,
  hashToken,
  hoursFromNow,
  minutesFromNow,
} from "@/lib/client-security/tokens";
import {
  logClientSecurityEvent,
  type SecurityRequestInfo,
} from "@/lib/client-security/security-events";
import { getClientPortalSecuritySettings } from "@/lib/settings";

type ClientUserForEmail = {
  id: string;
  name: string;
  email: string;
};

export type EmailDeliveryMode = EmailDeliveryResult;

const ONE_HOUR_MS = 1000 * 60 * 60;
const ONE_DAY_MS = ONE_HOUR_MS * 24;

function sinceDate(windowMs: number): Date {
  return new Date(Date.now() - windowMs);
}

function secondsUntil(date: Date, cooldownSeconds: number): number {
  const elapsedSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  return Math.max(0, cooldownSeconds - elapsedSeconds);
}

function deliveryMessage(deliveryMode: EmailDeliveryMode, sentText: string, consoleText: string): string {
  if (deliveryMode === "disabled") return "Email delivery is disabled.";
  return deliveryMode === "console" ? consoleText : sentText;
}

export async function sendVerificationEmailForClientUser({
  clientUser,
  requestInfo,
  enforceRateLimit = true,
}: {
  clientUser: ClientUserForEmail;
  requestInfo?: SecurityRequestInfo;
  enforceRateLimit?: boolean;
}): Promise<{ deliveryMode: EmailDeliveryMode; verificationUrl: string }> {
  const security = await getClientPortalSecuritySettings();

  if (enforceRateLimit && !security.allowResendVerificationEmail) {
    throw new Error("Verification email resends are currently disabled.");
  }

  if (enforceRateLimit) {
    const [recentCount, latestToken] = await Promise.all([
      prisma.clientEmailVerificationToken.count({
        where: {
          clientUserId: clientUser.id,
          createdAt: { gte: sinceDate(ONE_DAY_MS) },
        },
      }),
      prisma.clientEmailVerificationToken.findFirst({
        where: { clientUserId: clientUser.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    if (recentCount >= security.maxVerificationEmailsPerDay) {
      await logClientSecurityEvent({
        clientUserId: clientUser.id,
        type: "RATE_LIMITED",
        message: "Verification email daily limit reached.",
        requestInfo,
      });
      throw new Error("Please wait before requesting another verification email.");
    }

    if (latestToken) {
      const waitSeconds = secondsUntil(latestToken.createdAt, security.verificationResendCooldownSeconds);
      if (waitSeconds > 0) {
        await logClientSecurityEvent({
          clientUserId: clientUser.id,
          type: "RATE_LIMITED",
          message: "Verification email resend cooldown is active.",
          requestInfo,
        });
        throw new Error(`Please wait ${waitSeconds} seconds before requesting another verification email.`);
      }
    }
  }

  await prisma.clientEmailVerificationToken.updateMany({
    where: { clientUserId: clientUser.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const rawToken = generateVerificationToken();
  await prisma.clientEmailVerificationToken.create({
    data: {
      clientUserId: clientUser.id,
      tokenHash: hashToken(rawToken),
      expiresAt: hoursFromNow(security.verificationTokenExpirationHours),
    },
  });

  const verificationUrl = getAbsoluteUrl(`/client/verify-email?token=${encodeURIComponent(rawToken)}`);
  const deliveryMode = await sendEmail({
    to: clientUser.email,
    subject: "Welcome to your OIS client portal",
    text: [
      `Hi ${clientUser.name},`,
      "",
      "Welcome to your OIS client portal. Please verify your email to access your projects, invoices, documents, and update requests.",
      "",
      `Verify your email: ${verificationUrl}`,
      "",
      `This link expires in ${security.verificationTokenExpirationHours} hours.`,
      "",
      "If you were not expecting this invitation, you can ignore this email.",
    ].join("\n"),
    html: `
      <p>Hi ${clientUser.name},</p>
      <p>Welcome to your OIS client portal. Please verify your email to access your projects, invoices, documents, and update requests.</p>
      <p><a href="${verificationUrl}">Verify your email</a></p>
      <p>This link expires in ${security.verificationTokenExpirationHours} hours.</p>
      <p>If you were not expecting this invitation, you can ignore this email.</p>
    `,
  });

  await logClientSecurityEvent({
    clientUserId: clientUser.id,
    type: "VERIFICATION_EMAIL_SENT",
    message: deliveryMessage(
      deliveryMode,
      "Verification email sent.",
      "Verification email logged to console.",
    ),
    requestInfo,
  });

  return { deliveryMode, verificationUrl };
}

export async function issueLoginCode({
  clientUser,
  requestInfo,
  enforceRateLimit = true,
}: {
  clientUser: ClientUserForEmail;
  requestInfo?: SecurityRequestInfo;
  enforceRateLimit?: boolean;
}): Promise<{ codeId: string; deliveryMode: EmailDeliveryMode }> {
  const security = await getClientPortalSecuritySettings();

  if (enforceRateLimit) {
    const [recentCount, latestCode] = await Promise.all([
      prisma.clientLoginCode.count({
        where: {
          clientUserId: clientUser.id,
          createdAt: { gte: sinceDate(ONE_HOUR_MS) },
        },
      }),
      prisma.clientLoginCode.findFirst({
        where: { clientUserId: clientUser.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    if (recentCount >= security.maxLoginCodeSendsPerHour) {
      await logClientSecurityEvent({
        clientUserId: clientUser.id,
        type: "RATE_LIMITED",
        message: "Login code hourly send limit reached.",
        requestInfo,
      });
      throw new Error("Please wait before requesting another login code.");
    }

    if (latestCode) {
      const waitSeconds = secondsUntil(latestCode.createdAt, security.loginCodeResendCooldownSeconds);
      if (waitSeconds > 0) {
        await logClientSecurityEvent({
          clientUserId: clientUser.id,
          type: "RATE_LIMITED",
          message: "Login code resend cooldown is active.",
          requestInfo,
        });
        throw new Error(`Please wait ${waitSeconds} seconds before requesting another login code.`);
      }
    }
  }

  await prisma.clientLoginCode.updateMany({
    where: { clientUserId: clientUser.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const code = generateLoginCode(security.loginCodeLength);
  const loginCode = await prisma.clientLoginCode.create({
    data: {
      clientUserId: clientUser.id,
      codeHash: hashToken(code),
      expiresAt: minutesFromNow(security.loginCodeExpirationMinutes),
    },
  });

  const deliveryMode = await sendEmail({
    to: clientUser.email,
    subject: "Your OIS portal login code",
    text: [
      `Hi ${clientUser.name},`,
      "",
      `Your one-time OIS portal login code is ${code}.`,
      "",
      `This code expires in ${security.loginCodeExpirationMinutes} minutes and can only be used once.`,
    ].join("\n"),
    html: `
      <p>Hi ${clientUser.name},</p>
      <p>Your one-time OIS portal login code is <strong>${code}</strong>.</p>
      <p>This code expires in ${security.loginCodeExpirationMinutes} minutes and can only be used once.</p>
    `,
  });

  await logClientSecurityEvent({
    clientUserId: clientUser.id,
    type: "LOGIN_CODE_SENT",
    message: deliveryMessage(deliveryMode, "Login code sent.", "Login code logged to console."),
    requestInfo,
  });

  return { codeId: loginCode.id, deliveryMode };
}
