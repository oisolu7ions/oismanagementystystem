import { NextResponse } from "next/server";
import {
  CLIENT_LOGIN_CHALLENGE_COOKIE,
  CLIENT_SESSION_COOKIE,
} from "@/lib/auth/client-constants";
import { deleteClientLoginChallenge, deleteClientSession } from "@/lib/auth/client-session";

export async function GET(request: Request) {
  await deleteClientSession();
  await deleteClientLoginChallenge();

  const response = NextResponse.redirect(new URL("/client/login", request.url));
  response.cookies.delete(CLIENT_SESSION_COOKIE);
  response.cookies.delete(CLIENT_LOGIN_CHALLENGE_COOKIE);
  return response;
}
