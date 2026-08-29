import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@/generated/prisma/client";
import {
  ADMIN_MFA_CHALLENGE_COOKIE,
  ADMIN_MFA_CHALLENGE_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";

export type AdminMfaChallengePayload = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminMfaChallenge(
  payload: AdminMfaChallengePayload,
): Promise<void> {
  const token = await new SignJWT({ ...payload, kind: "admin-mfa-challenge" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_MFA_CHALLENGE_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_MFA_CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/login",
    maxAge: ADMIN_MFA_CHALLENGE_MAX_AGE_SECONDS,
  });
}

export async function getAdminMfaChallenge(): Promise<AdminMfaChallengePayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_MFA_CHALLENGE_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.kind !== "admin-mfa-challenge") return null;

    return {
      userId: String(payload.userId),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function deleteAdminMfaChallenge(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: ADMIN_MFA_CHALLENGE_COOKIE,
    path: "/login",
  });
}
