import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { ClientSessionPayload } from "@/types/client-session";
import {
  CLIENT_LOGIN_CHALLENGE_COOKIE,
  CLIENT_LOGIN_CHALLENGE_MAX_AGE_SECONDS,
  CLIENT_SESSION_COOKIE,
  CLIENT_SESSION_IDLE_TIMEOUT_SECONDS,
  CLIENT_SESSION_LAST_SEEN_UPDATE_SECONDS,
  CLIENT_SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/client-constants";
import { getSecurityRequestInfo, logClientSecurityEvent } from "@/lib/client-security/security-events";

export type ClientLoginChallengePayload = {
  clientUserId: string;
  clientId: string;
  email: string;
  name: string;
  codeId: string;
};

type CreateClientSessionPayload = Omit<ClientSessionPayload, "sessionId">;

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

async function revokeClientPortalSession(sessionId: string): Promise<void> {
  await prisma.clientPortalSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function touchClientPortalSession(sessionId: string, lastSeenAt: Date): Promise<void> {
  const staleBefore = new Date(Date.now() - CLIENT_SESSION_LAST_SEEN_UPDATE_SECONDS * 1000);
  if (lastSeenAt > staleBefore) return;

  await prisma.clientPortalSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { lastSeenAt: new Date() },
  });
}

export async function createClientSession(
  payload: CreateClientSessionPayload,
): Promise<void> {
  const requestInfo = await getSecurityRequestInfo();
  const now = new Date();
  const expiresAt = secondsFromNow(CLIENT_SESSION_MAX_AGE_SECONDS);

  await prisma.clientPortalSession.updateMany({
    where: { clientUserId: payload.clientUserId, expiresAt: { lte: now }, revokedAt: null },
    data: { revokedAt: now },
  });

  const session = await prisma.clientPortalSession.create({
    data: {
      clientUserId: payload.clientUserId,
      clientId: payload.clientId,
      expiresAt,
      lastSeenAt: now,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
    },
  });

  const token = await new SignJWT({
    ...payload,
    sessionId: session.id,
    kind: "client",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CLIENT_SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(CLIENT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CLIENT_SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteClientSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : undefined;
      if (sessionId) {
        await revokeClientPortalSession(sessionId);
        await logClientSecurityEvent({
          clientUserId:
            typeof payload.clientUserId === "string" ? payload.clientUserId : undefined,
          type: "SESSION_REVOKED",
          message: "Client portal session revoked on logout.",
          requestInfo: await getSecurityRequestInfo(),
          metadata: { sessionId },
        });
      }
    } catch {
      // The cookie is already invalid; deleting it is enough.
    }
  }

  cookieStore.delete(CLIENT_SESSION_COOKIE);
}

export async function createClientLoginChallenge(
  payload: ClientLoginChallengePayload,
): Promise<void> {
  const token = await new SignJWT({ ...payload, kind: "client-login-challenge" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CLIENT_LOGIN_CHALLENGE_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(CLIENT_LOGIN_CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/client/login",
    maxAge: CLIENT_LOGIN_CHALLENGE_MAX_AGE_SECONDS,
  });
}

export async function getClientLoginChallenge(): Promise<ClientLoginChallengePayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_LOGIN_CHALLENGE_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.kind !== "client-login-challenge") return null;

    return {
      clientUserId: String(payload.clientUserId),
      clientId: String(payload.clientId),
      email: String(payload.email),
      name: String(payload.name),
      codeId: String(payload.codeId),
    };
  } catch {
    return null;
  }
}

export async function deleteClientLoginChallenge(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CLIENT_LOGIN_CHALLENGE_COOKIE);
}

export async function getClientSession(): Promise<ClientSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.kind !== "client") return null;

    const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : undefined;
    const clientUserId =
      typeof payload.clientUserId === "string" ? payload.clientUserId : undefined;
    const clientId = typeof payload.clientId === "string" ? payload.clientId : undefined;
    if (!sessionId || !clientUserId || !clientId) return null;

    const now = new Date();
    const idleCutoff = new Date(now.getTime() - CLIENT_SESSION_IDLE_TIMEOUT_SECONDS * 1000);
    const session = await prisma.clientPortalSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        clientUserId: true,
        clientId: true,
        expiresAt: true,
        lastSeenAt: true,
        revokedAt: true,
      },
    });

    if (
      !session ||
      session.clientUserId !== clientUserId ||
      session.clientId !== clientId ||
      session.revokedAt ||
      session.expiresAt <= now ||
      session.lastSeenAt <= idleCutoff
    ) {
      if (session && !session.revokedAt) {
        await revokeClientPortalSession(session.id);
        if (session.expiresAt <= now || session.lastSeenAt <= idleCutoff) {
          await logClientSecurityEvent({
            clientUserId: session.clientUserId,
            type: "SESSION_EXPIRED",
            message: session.expiresAt <= now
              ? "Client portal session expired by absolute lifetime."
              : "Client portal session expired by idle timeout.",
            requestInfo: await getSecurityRequestInfo(),
            metadata: { sessionId: session.id },
          });
        }
      }
      return null;
    }

    await touchClientPortalSession(session.id, session.lastSeenAt);

    return {
      sessionId,
      clientUserId,
      clientId,
      email: String(payload.email),
      name: String(payload.name),
    };
  } catch {
    return null;
  }
}

export async function requireClientSession(): Promise<ClientSessionPayload> {
  const session = await getClientSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
