import { getEmailSettings } from "@/lib/settings";

export type SettingsSystemStatus = {
  nodeEnv: string;
  appUrl: string;
  emailProvider: string;
  smtpConfigured: boolean;
  emailFromConfigured: boolean;
  secureCookies: boolean;
  databaseLabel: string;
  warnings: string[];
};

function databaseLabel(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) return "Not configured";

  try {
    const url = new URL(raw);
    const database = url.pathname.replace(/^\//, "") || "database";
    return `${url.protocol}//${url.host}/${database}`;
  } catch {
    return "Configured";
  }
}

export async function getSettingsSystemStatus(): Promise<SettingsSystemStatus> {
  const emailSettings = await getEmailSettings();
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const appUrl = process.env.APP_URL ?? "Not configured";
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
  const emailFromConfigured = Boolean(emailSettings.from || process.env.EMAIL_FROM);
  const warnings: string[] = [];

  if (emailSettings.providerMode === "smtp" && appUrl.includes("localhost")) {
    warnings.push("SMTP is enabled while APP_URL points to localhost.");
  }
  if (nodeEnv === "production" && appUrl === "Not configured") {
    warnings.push("Production mode is missing APP_URL.");
  }
  if (nodeEnv === "production" && emailSettings.providerMode === "console") {
    warnings.push("Production mode is using console email delivery.");
  }
  if (process.env.APP_ENV !== "production" && process.env.OIS_VALIDATE_PRODUCTION_ENV !== "true") {
    warnings.push("Strict production env validation is off. Set APP_ENV=production or OIS_VALIDATE_PRODUCTION_ENV=true before launch.");
  }

  return {
    nodeEnv,
    appUrl,
    emailProvider: emailSettings.providerMode,
    smtpConfigured,
    emailFromConfigured,
    secureCookies: nodeEnv === "production",
    databaseLabel: databaseLabel(),
    warnings,
  };
}
