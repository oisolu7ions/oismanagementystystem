import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/auth/client-session";
import { prisma } from "@/lib/prisma";
import { getClientPortalSecuritySettings } from "@/lib/settings";

export async function requireClientPortalSession() {
  const session = await getClientSession();
  if (!session) {
    redirect("/client/login");
  }

  const security = await getClientPortalSecuritySettings();

  const clientUser = await prisma.clientUser.findUnique({
    where: { id: session.clientUserId },
    select: {
      id: true,
      clientId: true,
      isActive: true,
      emailVerifiedAt: true,
      client: { select: { status: true } },
    },
  });

  if (
    !clientUser ||
    clientUser.clientId !== session.clientId ||
    !clientUser.isActive ||
    (security.requireEmailVerification && !clientUser.emailVerifiedAt) ||
    clientUser.client.status === "INACTIVE" ||
    clientUser.client.status === "PAST_CLIENT"
  ) {
    redirect("/client/session-expired");
  }

  return session;
}
