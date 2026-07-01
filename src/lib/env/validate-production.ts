type Env = NodeJS.ProcessEnv;

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

function isPresent(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isStrictProduction(env: Env): boolean {
  return env.APP_ENV === "production" || env.OIS_VALIDATE_PRODUCTION_ENV === "true";
}

function isLocalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function validateUrl(name: string, value: string | undefined, errors: string[]): void {
  if (!isPresent(value)) {
    errors.push(`${name} is required.`);
    return;
  }

  try {
    new URL(value ?? "");
  } catch {
    errors.push(`${name} must be a valid absolute URL.`);
  }
}

function validateSmtp(env: Env, errors: string[], warnings: string[]): void {
  const smtpValues = [env.SMTP_HOST, env.SMTP_PORT, env.SMTP_USER, env.SMTP_PASS];
  const smtpTouched = smtpValues.some(isPresent) || env.EMAIL_PROVIDER === "smtp";
  if (!smtpTouched) return;

  for (const key of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"] as const) {
    if (!isPresent(env[key])) errors.push(`${key} is required when SMTP is configured.`);
  }

  if (isPresent(env.SMTP_PORT)) {
    const port = Number(env.SMTP_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      errors.push("SMTP_PORT must be a valid TCP port.");
    }
  }

  if (isPresent(env.SMTP_SECURE)) {
    const normalized = env.SMTP_SECURE?.toLowerCase();
    if (!normalized || (!TRUE_VALUES.has(normalized) && !FALSE_VALUES.has(normalized))) {
      errors.push('SMTP_SECURE must be "true" or "false" when set.');
    }
  }

  if (env.SMTP_HOST === "smtp.gmail.com" && env.SMTP_PORT === "587" && env.SMTP_SECURE === "true") {
    warnings.push("Gmail on port 587 should normally use SMTP_SECURE=false so STARTTLS can be issued.");
  }
}

export function validateProductionEnv(env: Env = process.env): void {
  const strict = isStrictProduction(env);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (strict) {
    if (!isPresent(env.DATABASE_URL)) errors.push("DATABASE_URL is required.");

    if (!isPresent(env.SESSION_SECRET)) {
      errors.push("SESSION_SECRET is required.");
    } else if ((env.SESSION_SECRET ?? "").length < 32) {
      errors.push("SESSION_SECRET must be at least 32 characters long.");
    } else if (env.SESSION_SECRET === "development-token-pepper") {
      errors.push("SESSION_SECRET must not use the development fallback value.");
    }

    validateUrl("APP_URL", env.APP_URL, errors);
    if (isPresent(env.APP_URL) && !isHttpsUrl(env.APP_URL ?? "")) {
      errors.push("APP_URL must use https:// in production.");
    }
    if (isPresent(env.APP_URL) && isLocalUrl(env.APP_URL ?? "")) {
      errors.push("APP_URL must not point to localhost in production.");
    }
  } else {
    if (isPresent(env.APP_URL)) {
      try {
        new URL(env.APP_URL ?? "");
      } catch {
        errors.push("APP_URL must be a valid absolute URL when set.");
      }
    }

    if (isPresent(env.SESSION_SECRET) && (env.SESSION_SECRET ?? "").length < 32) {
      warnings.push("SESSION_SECRET is set but shorter than 32 characters. Production validation will fail.");
    }
  }

  validateSmtp(env, errors, warnings);

  for (const warning of warnings) {
    console.warn(`[OIS env warning] ${warning}`);
  }

  if (errors.length > 0) {
    throw new Error(["OIS production environment validation failed:", ...errors.map((error) => `- ${error}`)].join("\n"));
  }
}
