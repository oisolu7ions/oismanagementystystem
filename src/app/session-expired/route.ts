import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { deleteSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  await deleteSession();

  const response = NextResponse.redirect(new URL("/login?expired=idle", request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
