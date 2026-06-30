import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CLIENT_SESSION_COOKIE } from "@/lib/auth/client-constants";
import { SESSION_COOKIE } from "@/lib/auth/constants";

function getSecretKey(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = getSecretKey();
  if (!token || !secret) return false;

  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

async function isClientAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(CLIENT_SESSION_COOKIE)?.value;
  const secret = getSecretKey();
  if (!token || !secret) return false;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.kind === "client";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminAuthed = await isAdminAuthenticated(request);
  const clientAuthed = await isClientAuthenticated(request);

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/documents") ||
    pathname.startsWith("/api/receipts") ||
    pathname.startsWith("/api/update-requests")
  ) {
    if (!adminAuthed) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/client/")) {
    if (!clientAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/client")) {
    if (pathname === "/client/login") {
      if (clientAuthed) {
        return NextResponse.redirect(new URL("/client/dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (!clientAuthed) {
      const loginUrl = new URL("/client/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname === "/login" && adminAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (clientAuthed && pathname === "/") {
    return NextResponse.redirect(new URL("/client/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/documents/:path*",
    "/api/receipts/:path*",
    "/api/update-requests/:path*",
    "/api/client/:path*",
    "/client/:path*",
    "/login",
  ],
};
