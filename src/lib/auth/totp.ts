import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { generateSecret, generateURI, verifySync } from "otplib";

const TOTP_ISSUER = "OIS Management Center";

function getEncryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long.");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptTotpSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptTotpSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted TOTP secret format.");
  }

  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const encrypted = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export function createTotpEnrollment(email: string) {
  const secret = generateSecret();
  const otpauthUrl = generateURI({
    issuer: TOTP_ISSUER,
    label: email,
    secret,
  });

  return { secret, otpauthUrl };
}

export function verifyTotpCode(secret: string, token: string): boolean {
  const normalized = token.replace(/\s+/g, "");
  if (!/^\d{6,8}$/.test(normalized)) return false;

  const result = verifySync({
    secret,
    token: normalized,
    epochTolerance: 1,
  });

  return result.valid;
}

export function getTotpIssuer(): string {
  return TOTP_ISSUER;
}
