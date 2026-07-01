import { NextResponse } from "next/server";
import {
  CLIENT_LOGIN_CHALLENGE_COOKIE,
  CLIENT_SESSION_COOKIE,
} from "@/lib/auth/client-constants";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/client/login", request.url));
  response.cookies.delete(CLIENT_SESSION_COOKIE);
  response.cookies.delete(CLIENT_LOGIN_CHALLENGE_COOKIE);
  return response;
}
