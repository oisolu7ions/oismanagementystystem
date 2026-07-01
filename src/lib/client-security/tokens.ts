import { createHash, randomBytes, randomInt } from "crypto";

function getTokenPepper(): string {
  return process.env.SESSION_SECRET ?? "development-token-pepper";
}

export function hashToken(value: string): string {
  return createHash("sha256")
    .update(`${getTokenPepper()}:${value}`)
    .digest("hex");
}

export function generateVerificationToken(): string {
  return randomBytes(32).toString("base64url");
}

export function generateLoginCode(length = 6): string {
  const safeLength = length === 8 ? 8 : 6;
  const max = 10 ** safeLength;
  return String(randomInt(0, max)).padStart(safeLength, "0");
}

export function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
