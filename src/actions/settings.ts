"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendEmail } from "@/lib/email/provider";
import { requireSession } from "@/lib/auth/session";
import { getSecurityRequestInfo, logClientSecurityEvent } from "@/lib/client-security/security-events";
import { getSetting, updateSetting } from "@/lib/settings";
import type { SettingType } from "@/lib/settings/defaults";

export type SettingsActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

type SettingChange = {
  key: string;
  value: string;
  type: SettingType;
  label: string;
  audit?: boolean;
};

const booleanField = z.preprocess(
  (value) => value === "true" || value === "on" || value === true,
  z.boolean(),
);

const optionalString = z.string().trim().optional().transform((value) => value ?? "");
const requiredString = z.string().trim().min(1, "Required");
const providerModeSchema = z.enum(["console", "smtp", "disabled"]);
const urlField = z.string().trim().refine(
  (value) => value === "" || value.startsWith("/") || /^https?:\/\//i.test(value),
  "Use a relative path or a full http(s) URL",
);

function formatZodErrors(issues: { path: PropertyKey[]; message: string }[]): SettingsActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

async function saveSettings(changes: SettingChange[]): Promise<void> {
  const requestInfo = await getSecurityRequestInfo();

  for (const change of changes) {
    const previous = await getSetting(change.key, "");
    await updateSetting(change.key, change.value, change.type);

    if (change.audit && previous !== change.value) {
      await logClientSecurityEvent({
        type: "ADMIN_SETTING_CHANGED",
        message: `Admin setting changed: ${change.label}.`,
        requestInfo,
      });
    }
  }

  revalidatePath("/dashboard/settings");
}

const businessSchema = z.object({
  name: requiredString,
  supportEmail: optionalString,
  supportPhone: optionalString,
  websiteUrl: urlField,
  defaultSenderName: requiredString,
  defaultEmailFooterText: optionalString,
});

export async function updateBusinessSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireSession();
  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
    supportEmail: formData.get("supportEmail"),
    supportPhone: formData.get("supportPhone"),
    websiteUrl: formData.get("websiteUrl"),
    defaultSenderName: formData.get("defaultSenderName"),
    defaultEmailFooterText: formData.get("defaultEmailFooterText"),
  });

  if (!parsed.success) return formatZodErrors(parsed.error.issues);

  await saveSettings([
    { key: "business.name", value: parsed.data.name, type: "STRING", label: "Business name" },
    { key: "business.supportEmail", value: parsed.data.supportEmail, type: "STRING", label: "Support email" },
    { key: "business.supportPhone", value: parsed.data.supportPhone, type: "STRING", label: "Support phone" },
    { key: "business.websiteUrl", value: parsed.data.websiteUrl, type: "STRING", label: "Website URL" },
    { key: "business.defaultSenderName", value: parsed.data.defaultSenderName, type: "STRING", label: "Default sender name" },
    { key: "business.defaultEmailFooterText", value: parsed.data.defaultEmailFooterText, type: "STRING", label: "Default email footer text" },
  ]);

  return { success: "Business profile saved." };
}

const emailSchema = z.object({
  providerMode: providerModeSchema,
  from: requiredString,
  replyTo: optionalString,
  testRecipient: optionalString,
});

export async function updateEmailSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireSession();
  const parsed = emailSchema.safeParse({
    providerMode: formData.get("providerMode"),
    from: formData.get("from"),
    replyTo: formData.get("replyTo"),
    testRecipient: formData.get("testRecipient"),
  });

  if (!parsed.success) return formatZodErrors(parsed.error.issues);

  await saveSettings([
    { key: "email.providerMode", value: parsed.data.providerMode, type: "STRING", label: "Email provider mode", audit: true },
    { key: "email.from", value: parsed.data.from, type: "STRING", label: "Email From" },
    { key: "email.replyTo", value: parsed.data.replyTo, type: "STRING", label: "Reply-To" },
    { key: "email.testRecipient", value: parsed.data.testRecipient, type: "STRING", label: "Test recipient" },
  ]);

  return { success: "Email settings saved." };
}

const securitySchema = z.object({
  requireEmailVerification: booleanField,
  requireLoginCode: booleanField,
  loginCodeExpirationMinutes: z.coerce.number().int().min(5).max(30),
  verificationTokenExpirationHours: z.coerce.number().int().min(1).max(72),
  maxLoginCodeAttempts: z.coerce.number().int().min(3).max(10),
  loginCodeLength: z.coerce.number().int().refine((value) => value === 6 || value === 8, "Use 6 or 8 digits"),
  allowResendVerificationEmail: booleanField,
  loginCodeResendCooldownSeconds: z.coerce.number().int().positive(),
  verificationResendCooldownSeconds: z.coerce.number().int().positive(),
  maxLoginCodeSendsPerHour: z.coerce.number().int().positive(),
  maxVerificationEmailsPerDay: z.coerce.number().int().positive(),
});

export async function updateSecuritySettingsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireSession();
  const parsed = securitySchema.safeParse({
    requireEmailVerification: formData.get("requireEmailVerification"),
    requireLoginCode: formData.get("requireLoginCode"),
    loginCodeExpirationMinutes: formData.get("loginCodeExpirationMinutes"),
    verificationTokenExpirationHours: formData.get("verificationTokenExpirationHours"),
    maxLoginCodeAttempts: formData.get("maxLoginCodeAttempts"),
    loginCodeLength: formData.get("loginCodeLength"),
    allowResendVerificationEmail: formData.get("allowResendVerificationEmail"),
    loginCodeResendCooldownSeconds: formData.get("loginCodeResendCooldownSeconds"),
    verificationResendCooldownSeconds: formData.get("verificationResendCooldownSeconds"),
    maxLoginCodeSendsPerHour: formData.get("maxLoginCodeSendsPerHour"),
    maxVerificationEmailsPerDay: formData.get("maxVerificationEmailsPerDay"),
  });

  if (!parsed.success) return formatZodErrors(parsed.error.issues);

  await saveSettings([
    { key: "clientPortal.requireEmailVerification", value: String(parsed.data.requireEmailVerification), type: "BOOLEAN", label: "Require email verification", audit: true },
    { key: "clientPortal.requireLoginCode", value: String(parsed.data.requireLoginCode), type: "BOOLEAN", label: "Require login code", audit: true },
    { key: "clientPortal.loginCodeExpirationMinutes", value: String(parsed.data.loginCodeExpirationMinutes), type: "NUMBER", label: "Login code expiration" },
    { key: "clientPortal.verificationTokenExpirationHours", value: String(parsed.data.verificationTokenExpirationHours), type: "NUMBER", label: "Verification link expiration" },
    { key: "clientPortal.maxLoginCodeAttempts", value: String(parsed.data.maxLoginCodeAttempts), type: "NUMBER", label: "Max login code attempts" },
    { key: "clientPortal.loginCodeLength", value: String(parsed.data.loginCodeLength), type: "NUMBER", label: "Login code length" },
    { key: "clientPortal.allowResendVerificationEmail", value: String(parsed.data.allowResendVerificationEmail), type: "BOOLEAN", label: "Allow verification resend" },
    { key: "clientPortal.loginCodeResendCooldownSeconds", value: String(parsed.data.loginCodeResendCooldownSeconds), type: "NUMBER", label: "Login code resend cooldown" },
    { key: "clientPortal.verificationResendCooldownSeconds", value: String(parsed.data.verificationResendCooldownSeconds), type: "NUMBER", label: "Verification resend cooldown" },
    { key: "clientPortal.maxLoginCodeSendsPerHour", value: String(parsed.data.maxLoginCodeSendsPerHour), type: "NUMBER", label: "Max login code sends per hour" },
    { key: "clientPortal.maxVerificationEmailsPerDay", value: String(parsed.data.maxVerificationEmailsPerDay), type: "NUMBER", label: "Max verification emails per day" },
  ]);

  return { success: "Security settings saved." };
}

const defaultsSchema = z.object({
  defaultUserActive: booleanField,
  autoSendWelcomeEmail: booleanField,
  requireEmailVerificationForNewUsers: booleanField,
  defaultProjectVisible: booleanField,
  defaultTaskVisible: booleanField,
  defaultInvoiceVisible: booleanField,
  defaultDocumentVisible: booleanField,
  defaultUpdateRequestsEnabled: booleanField,
});

export async function updatePortalDefaultSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireSession();
  const parsed = defaultsSchema.safeParse({
    defaultUserActive: formData.get("defaultUserActive"),
    autoSendWelcomeEmail: formData.get("autoSendWelcomeEmail"),
    requireEmailVerificationForNewUsers: formData.get("requireEmailVerificationForNewUsers"),
    defaultProjectVisible: formData.get("defaultProjectVisible"),
    defaultTaskVisible: formData.get("defaultTaskVisible"),
    defaultInvoiceVisible: formData.get("defaultInvoiceVisible"),
    defaultDocumentVisible: formData.get("defaultDocumentVisible"),
    defaultUpdateRequestsEnabled: formData.get("defaultUpdateRequestsEnabled"),
  });

  if (!parsed.success) return formatZodErrors(parsed.error.issues);

  await saveSettings([
    { key: "clientPortal.defaultUserActive", value: String(parsed.data.defaultUserActive), type: "BOOLEAN", label: "Default portal user active" },
    { key: "clientPortal.autoSendWelcomeEmail", value: String(parsed.data.autoSendWelcomeEmail), type: "BOOLEAN", label: "Auto-send welcome email" },
    { key: "clientPortal.requireEmailVerificationForNewUsers", value: String(parsed.data.requireEmailVerificationForNewUsers), type: "BOOLEAN", label: "Require verification for new users" },
    { key: "clientPortal.defaultProjectVisible", value: String(parsed.data.defaultProjectVisible), type: "BOOLEAN", label: "Default project visibility", audit: true },
    { key: "clientPortal.defaultTaskVisible", value: String(parsed.data.defaultTaskVisible), type: "BOOLEAN", label: "Default task visibility", audit: true },
    { key: "clientPortal.defaultInvoiceVisible", value: String(parsed.data.defaultInvoiceVisible), type: "BOOLEAN", label: "Default invoice visibility", audit: true },
    { key: "clientPortal.defaultDocumentVisible", value: String(parsed.data.defaultDocumentVisible), type: "BOOLEAN", label: "Default document visibility", audit: true },
    { key: "clientPortal.defaultUpdateRequestsEnabled", value: String(parsed.data.defaultUpdateRequestsEnabled), type: "BOOLEAN", label: "Default update requests availability", audit: true },
  ]);

  return { success: "Client portal defaults saved." };
}

const legalSchema = z.object({
  contactUrl: urlField,
  privacyUrl: urlField,
  termsUrl: urlField,
  securityUrl: urlField,
  accessibilityUrl: urlField,
  showFooterOnAuthPages: booleanField,
  showFooterInPortal: booleanField,
});

export async function updateLegalSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireSession();
  const parsed = legalSchema.safeParse({
    contactUrl: formData.get("contactUrl"),
    privacyUrl: formData.get("privacyUrl"),
    termsUrl: formData.get("termsUrl"),
    securityUrl: formData.get("securityUrl"),
    accessibilityUrl: formData.get("accessibilityUrl"),
    showFooterOnAuthPages: formData.get("showFooterOnAuthPages"),
    showFooterInPortal: formData.get("showFooterInPortal"),
  });

  if (!parsed.success) return formatZodErrors(parsed.error.issues);

  await saveSettings([
    { key: "legal.contactUrl", value: parsed.data.contactUrl, type: "STRING", label: "Contact URL" },
    { key: "legal.privacyUrl", value: parsed.data.privacyUrl, type: "STRING", label: "Privacy URL" },
    { key: "legal.termsUrl", value: parsed.data.termsUrl, type: "STRING", label: "Terms URL" },
    { key: "legal.securityUrl", value: parsed.data.securityUrl, type: "STRING", label: "Security URL" },
    { key: "legal.accessibilityUrl", value: parsed.data.accessibilityUrl, type: "STRING", label: "Accessibility URL" },
    { key: "legal.showFooterOnAuthPages", value: String(parsed.data.showFooterOnAuthPages), type: "BOOLEAN", label: "Show footer on auth pages" },
    { key: "legal.showFooterInPortal", value: String(parsed.data.showFooterInPortal), type: "BOOLEAN", label: "Show footer in portal" },
  ]);

  return { success: "Legal/footer settings saved." };
}

const testEmailSchema = z.object({
  testRecipient: z.string().trim().email("Enter a valid recipient email"),
});

export async function sendTestEmailAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireSession();
  const parsed = testEmailSchema.safeParse({
    testRecipient: formData.get("testRecipient"),
  });

  if (!parsed.success) return formatZodErrors(parsed.error.issues);

  const requestInfo = await getSecurityRequestInfo();
  const deliveryMode = await sendEmail({
    to: parsed.data.testRecipient,
    subject: "OIS test email",
    text: "This is a test email from OIS Management Center settings.",
  });

  await logClientSecurityEvent({
    type: "TEST_EMAIL_SENT",
    message: `Admin sent a test email using ${deliveryMode} delivery mode.`,
    requestInfo,
  });

  return {
    success: deliveryMode === "disabled"
      ? "Email delivery is disabled. No test email was sent."
      : deliveryMode === "console"
        ? "Test email logged to the development console."
        : "Test email sent.",
  };
}
