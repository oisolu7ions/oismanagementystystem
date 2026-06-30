"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  createClientSession,
  deleteClientSession,
} from "@/lib/auth/client-session";
import { clientPortalLoginSchema } from "@/lib/validators/client-user";

export type ClientPortalAuthState = {
  error?: string;
};

export async function clientLoginAction(
  _prevState: ClientPortalAuthState,
  formData: FormData,
): Promise<ClientPortalAuthState> {
  const parsed = clientPortalLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const clientUser = await prisma.clientUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    include: {
      client: { select: { id: true, name: true, status: true } },
    },
  });

  if (!clientUser || !clientUser.isActive) {
    return { error: "Invalid email or password" };
  }

  if (clientUser.client.status === "INACTIVE" || clientUser.client.status === "PAST_CLIENT") {
    return { error: "Portal access is not available for this account." };
  }

  const valid = await verifyPassword(parsed.data.password, clientUser.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  await prisma.clientUser.update({
    where: { id: clientUser.id },
    data: { lastLoginAt: new Date() },
  });

  await createClientSession({
    clientUserId: clientUser.id,
    clientId: clientUser.clientId,
    email: clientUser.email,
    name: clientUser.name,
  });

  redirect("/client/dashboard");
}

export async function clientLogoutAction(): Promise<void> {
  await deleteClientSession();
  redirect("/client/login");
}
