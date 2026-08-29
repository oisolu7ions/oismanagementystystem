import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/client-session";

export async function POST() {
  const session = await getClientSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
