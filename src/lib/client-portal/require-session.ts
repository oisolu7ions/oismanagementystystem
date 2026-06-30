import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/auth/client-session";

export async function requireClientPortalSession() {
  const session = await getClientSession();
  if (!session) {
    redirect("/client/login");
  }
  return session;
}
