import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import type { SecurityRequestInfo } from "@/lib/client-security/security-events";

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: Date;
};

type RateLimitInput = {
  scope: string;
  key: string;
  limit: number;
  windowSeconds: number;
};

const ONE_MINUTE_SECONDS = 60;

function normalizeKey(key: string): string {
  const trimmed = key.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : "unknown";
}

function hashBucketKey(scope: string, key: string): string {
  return createHash("sha256")
    .update(`${scope}:${normalizeKey(key)}`)
    .digest("hex");
}

function getRetryAfterSeconds(resetAt: Date, now: Date): number {
  return Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000));
}

export function getIpRateLimitKey(requestInfo?: SecurityRequestInfo): string {
  return requestInfo?.ipAddress ?? "unknown-ip";
}

export function rateLimitMessage(seconds: number): string {
  const minutes = Math.max(1, Math.ceil(seconds / ONE_MINUTE_SECONDS));
  return `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export async function consumeRateLimit({
  scope,
  key,
  limit,
  windowSeconds,
}: RateLimitInput): Promise<RateLimitResult> {
  const now = new Date();
  const bucketKey = hashBucketKey(scope, key);
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  const existing = await prisma.rateLimitBucket.findUnique({
    where: { scope_key: { scope, key: bucketKey } },
  });

  if (!existing || existing.resetAt <= now) {
    const bucket = await prisma.rateLimitBucket.upsert({
      where: { scope_key: { scope, key: bucketKey } },
      update: { count: 1, resetAt },
      create: { scope, key: bucketKey, count: 1, resetAt },
    });

    return {
      limited: false,
      remaining: Math.max(0, limit - bucket.count),
      retryAfterSeconds: 0,
      resetAt: bucket.resetAt,
    };
  }

  if (existing.count >= limit) {
    return {
      limited: true,
      remaining: 0,
      retryAfterSeconds: getRetryAfterSeconds(existing.resetAt, now),
      resetAt: existing.resetAt,
    };
  }

  const bucket = await prisma.rateLimitBucket.update({
    where: { scope_key: { scope, key: bucketKey } },
    data: { count: { increment: 1 } },
  });

  return {
    limited: false,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: 0,
    resetAt: bucket.resetAt,
  };
}
