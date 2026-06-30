import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { ClientSessionPayload } from "@/types/client-session";
import {
  CLIENT_SESSION_COOKIE,
  CLIENT_SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/client-constants";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set and at least 32 characters long.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createClientSession(
  payload: ClientSessionPayload,
): Promise<void> {
  const token = await new SignJWT({ ...payload, kind: "client" })
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
  cookieStore.delete(CLIENT_SESSION_COOKIE);
}

export async function getClientSession(): Promise<ClientSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.kind !== "client") return null;

    return {
      clientUserId: String(payload.clientUserId),
      clientId: String(payload.clientId),
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
