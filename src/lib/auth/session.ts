import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/types/session";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import { getSecurityRequestInfo, logClientSecurityEvent } from "@/lib/client-security/security-events";

type CreateSessionPayload = Omit<SessionPayload, "sessionId">;

const ADMIN_SESSION_IDLE_TIMEOUT_SECONDS = 60 * 60 * 12;
const LAST_SEEN_UPDATE_INTERVAL_SECONDS = 60 * 5;

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set and at least 32 characters long.",
    );
  }
  return new TextEncoder().encode(secret);
}

function secondsFromNow(seconds: number): Date {
  return new Date(Date.now() + seconds * 1000);
}

async function revokeAdminSession(sessionId: string): Promise<void> {
  await prisma.adminSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function touchAdminSession(sessionId: string, lastSeenAt: Date): Promise<void> {
  const staleBefore = new Date(Date.now() - LAST_SEEN_UPDATE_INTERVAL_SECONDS * 1000);
  if (lastSeenAt > staleBefore) return;

  await prisma.adminSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { lastSeenAt: new Date() },
  });
}

export async function createSession(payload: CreateSessionPayload): Promise<void> {
  const requestInfo = await getSecurityRequestInfo();
  const now = new Date();
  const expiresAt = secondsFromNow(SESSION_MAX_AGE_SECONDS);

  await prisma.adminSession.updateMany({
    where: { userId: payload.userId, expiresAt: { lte: now }, revokedAt: null },
    data: { revokedAt: now },
  });

  const session = await prisma.adminSession.create({
    data: {
      userId: payload.userId,
      expiresAt,
      lastSeenAt: now,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
    },
  });

  const token = await new SignJWT({ ...payload, sessionId: session.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : undefined;
      if (sessionId) {
        await revokeAdminSession(sessionId);
        await logClientSecurityEvent({
          userId: typeof payload.userId === "string" ? payload.userId : undefined,
          type: "SESSION_REVOKED",
          message: "Admin session revoked on logout.",
          requestInfo: await getSecurityRequestInfo(),
          metadata: { sessionId },
        });
      }
    } catch {
      // The cookie is already invalid; deleting it is enough.
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : undefined;
    const userId = typeof payload.userId === "string" ? payload.userId : undefined;
    if (!sessionId || !userId) return null;

    const now = new Date();
    const idleCutoff = new Date(now.getTime() - ADMIN_SESSION_IDLE_TIMEOUT_SECONDS * 1000);
    const session = await prisma.adminSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        lastSeenAt: true,
        revokedAt: true,
      },
    });

    if (
      !session ||
      session.userId !== userId ||
      session.revokedAt ||
      session.expiresAt <= now ||
      session.lastSeenAt <= idleCutoff
    ) {
      if (session && !session.revokedAt) {
        await revokeAdminSession(session.id);
        if (session.expiresAt <= now || session.lastSeenAt <= idleCutoff) {
          await logClientSecurityEvent({
            userId: session.userId,
            type: "SESSION_EXPIRED",
            message: session.expiresAt <= now
              ? "Admin session expired by absolute lifetime."
              : "Admin session expired by idle timeout.",
            requestInfo: await getSecurityRequestInfo(),
            metadata: { sessionId: session.id },
          });
        }
      }
      return null;
    }

    await touchAdminSession(session.id, session.lastSeenAt);

    return {
      sessionId,
      userId,
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as SessionPayload["role"],
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
