export type SettingType = "STRING" | "BOOLEAN" | "NUMBER" | "JSON";

export type DefaultSetting = {
  key: string;
  value: string;
  type: SettingType;
  group: string;
  description: string;
  isSecret?: boolean;
};

export const defaultSettings: DefaultSetting[] = [
  { key: "business.name", value: "OIS", type: "STRING", group: "business", description: "Business name shown in client-facing messages." },
  { key: "business.supportEmail", value: "", type: "STRING", group: "business", description: "Support email address for client help." },
  { key: "business.supportPhone", value: "", type: "STRING", group: "business", description: "Support phone number for client help." },
  { key: "business.websiteUrl", value: "", type: "STRING", group: "business", description: "Public business website URL." },
  { key: "business.defaultSenderName", value: "OIS Management Center", type: "STRING", group: "business", description: "Display name used in emails." },
  { key: "business.defaultEmailFooterText", value: "", type: "STRING", group: "business", description: "Optional footer text appended to client emails." },

  { key: "email.providerMode", value: "console", type: "STRING", group: "email", description: "Email provider behavior: console, smtp, or disabled." },
  { key: "email.from", value: "OIS Management Center <no-reply@localhost>", type: "STRING", group: "email", description: "Non-secret From address/display name." },
  { key: "email.replyTo", value: "", type: "STRING", group: "email", description: "Optional Reply-To email address." },
  { key: "email.testRecipient", value: "", type: "STRING", group: "email", description: "Default recipient for test emails." },

  { key: "clientPortal.requireEmailVerification", value: "true", type: "BOOLEAN", group: "clientPortalSecurity", description: "Require verified email before client portal login." },
  { key: "clientPortal.requireLoginCode", value: "true", type: "BOOLEAN", group: "clientPortalSecurity", description: "Require a one-time login code after password entry." },
  { key: "clientPortal.loginCodeExpirationMinutes", value: "10", type: "NUMBER", group: "clientPortalSecurity", description: "Minutes before login codes expire." },
  { key: "clientPortal.verificationTokenExpirationHours", value: "24", type: "NUMBER", group: "clientPortalSecurity", description: "Hours before verification links expire." },
  { key: "clientPortal.maxLoginCodeAttempts", value: "5", type: "NUMBER", group: "clientPortalSecurity", description: "Maximum wrong attempts per login code." },
  { key: "clientPortal.loginCodeLength", value: "6", type: "NUMBER", group: "clientPortalSecurity", description: "Login code length, 6 or 8 digits." },
  { key: "clientPortal.allowResendVerificationEmail", value: "true", type: "BOOLEAN", group: "clientPortalSecurity", description: "Allow users/admins to resend verification email." },
  { key: "clientPortal.loginCodeResendCooldownSeconds", value: "60", type: "NUMBER", group: "clientPortalSecurity", description: "Cooldown between login code resend attempts." },
  { key: "clientPortal.verificationResendCooldownSeconds", value: "300", type: "NUMBER", group: "clientPortalSecurity", description: "Cooldown between verification email resend attempts." },
  { key: "clientPortal.maxLoginCodeSendsPerHour", value: "5", type: "NUMBER", group: "clientPortalSecurity", description: "Maximum login codes sent per hour." },
  { key: "clientPortal.maxVerificationEmailsPerDay", value: "5", type: "NUMBER", group: "clientPortalSecurity", description: "Maximum verification emails sent per day." },

  { key: "clientPortal.defaultUserActive", value: "true", type: "BOOLEAN", group: "clientPortalDefaults", description: "New client portal users are active by default." },
  { key: "clientPortal.autoSendWelcomeEmail", value: "true", type: "BOOLEAN", group: "clientPortalDefaults", description: "Automatically send welcome verification email when creating portal users." },
  { key: "clientPortal.requireEmailVerificationForNewUsers", value: "true", type: "BOOLEAN", group: "clientPortalDefaults", description: "New portal users must verify email by default." },
  { key: "clientPortal.defaultProjectVisible", value: "false", type: "BOOLEAN", group: "clientPortalDefaults", description: "Default client visibility for new projects." },
  { key: "clientPortal.defaultTaskVisible", value: "false", type: "BOOLEAN", group: "clientPortalDefaults", description: "Default client visibility for new tasks." },
  { key: "clientPortal.defaultInvoiceVisible", value: "true", type: "BOOLEAN", group: "clientPortalDefaults", description: "Default client visibility for new invoices." },
  { key: "clientPortal.defaultDocumentVisible", value: "false", type: "BOOLEAN", group: "clientPortalDefaults", description: "Default client visibility for new documents." },
  { key: "clientPortal.defaultUpdateRequestsEnabled", value: "true", type: "BOOLEAN", group: "clientPortalDefaults", description: "Enable client update request availability by default." },

  { key: "legal.contactUrl", value: "/contact", type: "STRING", group: "legal", description: "Contact footer URL." },
  { key: "legal.privacyUrl", value: "/legal/privacy", type: "STRING", group: "legal", description: "Privacy footer URL." },
  { key: "legal.termsUrl", value: "/legal/terms", type: "STRING", group: "legal", description: "Terms footer URL." },
  { key: "legal.securityUrl", value: "/legal/security", type: "STRING", group: "legal", description: "Security footer URL." },
  { key: "legal.accessibilityUrl", value: "/legal/accessibility", type: "STRING", group: "legal", description: "Accessibility footer URL." },
  { key: "legal.showFooterOnAuthPages", value: "true", type: "BOOLEAN", group: "legal", description: "Show footer on client authentication pages." },
  { key: "legal.showFooterInPortal", value: "true", type: "BOOLEAN", group: "legal", description: "Show footer inside the client portal after login." },
];
