import { prisma } from "@/lib/prisma";
import { defaultSettings, type DefaultSetting, type SettingType } from "@/lib/settings/defaults";

function defaultByKey(key: string): DefaultSetting | undefined {
  return defaultSettings.find((setting) => setting.key === key);
}

export async function ensureDefaultSettings(): Promise<void> {
  await Promise.all(
    defaultSettings.map((setting) =>
      prisma.setting.upsert({
        where: { key: setting.key },
        update: {},
        create: {
          key: setting.key,
          value: setting.value,
          type: setting.type,
          group: setting.group,
          description: setting.description,
          isSecret: setting.isSecret ?? false,
        },
      }),
    ),
  );
}

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? defaultByKey(key)?.value ?? fallback;
}

export async function getBooleanSetting(key: string, fallback: boolean): Promise<boolean> {
  const value = await getSetting(key, String(fallback));
  return value === "true";
}

export async function getNumberSetting(key: string, fallback: number): Promise<number> {
  const value = Number(await getSetting(key, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

export async function getJsonSetting<T>(key: string, fallback: T): Promise<T> {
  const value = await getSetting(key, JSON.stringify(fallback));
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function updateSetting(key: string, value: string, type?: SettingType): Promise<void> {
  const fallback = defaultByKey(key);
  await prisma.setting.upsert({
    where: { key },
    update: { value, type: type ?? fallback?.type ?? "STRING" },
    create: {
      key,
      value,
      type: type ?? fallback?.type ?? "STRING",
      group: fallback?.group ?? "custom",
      description: fallback?.description,
      isSecret: fallback?.isSecret ?? false,
    },
  });
}

export async function getEmailSettings() {
  return {
    providerMode: await getSetting("email.providerMode", "console") as "console" | "smtp" | "disabled",
    from: await getSetting("email.from", "OIS Management Center <no-reply@localhost>"),
    replyTo: await getSetting("email.replyTo", ""),
    testRecipient: await getSetting("email.testRecipient", ""),
  };
}

export async function getBusinessSettings() {
  return {
    name: await getSetting("business.name", "OIS"),
    supportEmail: await getSetting("business.supportEmail", ""),
    supportPhone: await getSetting("business.supportPhone", ""),
    websiteUrl: await getSetting("business.websiteUrl", ""),
    defaultSenderName: await getSetting("business.defaultSenderName", "OIS Management Center"),
    defaultEmailFooterText: await getSetting("business.defaultEmailFooterText", ""),
  };
}

export async function getClientPortalSecuritySettings() {
  return {
    requireEmailVerification: await getBooleanSetting("clientPortal.requireEmailVerification", true),
    requireLoginCode: await getBooleanSetting("clientPortal.requireLoginCode", true),
    loginCodeExpirationMinutes: await getNumberSetting("clientPortal.loginCodeExpirationMinutes", 10),
    verificationTokenExpirationHours: await getNumberSetting("clientPortal.verificationTokenExpirationHours", 24),
    maxLoginCodeAttempts: await getNumberSetting("clientPortal.maxLoginCodeAttempts", 5),
    loginCodeLength: await getNumberSetting("clientPortal.loginCodeLength", 6),
    allowResendVerificationEmail: await getBooleanSetting("clientPortal.allowResendVerificationEmail", true),
    loginCodeResendCooldownSeconds: await getNumberSetting("clientPortal.loginCodeResendCooldownSeconds", 60),
    verificationResendCooldownSeconds: await getNumberSetting("clientPortal.verificationResendCooldownSeconds", 300),
    maxLoginCodeSendsPerHour: await getNumberSetting("clientPortal.maxLoginCodeSendsPerHour", 5),
    maxVerificationEmailsPerDay: await getNumberSetting("clientPortal.maxVerificationEmailsPerDay", 5),
  };
}

export async function getPortalDefaultSettings() {
  return {
    defaultUserActive: await getBooleanSetting("clientPortal.defaultUserActive", true),
    autoSendWelcomeEmail: await getBooleanSetting("clientPortal.autoSendWelcomeEmail", true),
    requireEmailVerificationForNewUsers: await getBooleanSetting("clientPortal.requireEmailVerificationForNewUsers", true),
    defaultProjectVisible: await getBooleanSetting("clientPortal.defaultProjectVisible", false),
    defaultTaskVisible: await getBooleanSetting("clientPortal.defaultTaskVisible", false),
    defaultInvoiceVisible: await getBooleanSetting("clientPortal.defaultInvoiceVisible", true),
    defaultDocumentVisible: await getBooleanSetting("clientPortal.defaultDocumentVisible", false),
    defaultUpdateRequestsEnabled: await getBooleanSetting("clientPortal.defaultUpdateRequestsEnabled", true),
  };
}

export async function getLegalSettings() {
  return {
    contactUrl: await getSetting("legal.contactUrl", "/contact"),
    privacyUrl: await getSetting("legal.privacyUrl", "/legal/privacy"),
    termsUrl: await getSetting("legal.termsUrl", "/legal/terms"),
    securityUrl: await getSetting("legal.securityUrl", "/legal/security"),
    accessibilityUrl: await getSetting("legal.accessibilityUrl", "/legal/accessibility"),
    showFooterOnAuthPages: await getBooleanSetting("legal.showFooterOnAuthPages", true),
    showFooterInPortal: await getBooleanSetting("legal.showFooterInPortal", true),
  };
}
