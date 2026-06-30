"use server";

import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { clientUserFormSchema } from "@/lib/validators/client-user";

export type ClientUserActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function formatZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): ClientUserActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

function revalidateClientUserPaths(clientId: string) {
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function getClientUsersByClientId(clientId: string) {
  return prisma.clientUser.findMany({
    where: { clientId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}

export async function getClientPortalAccessSummary(clientId: string) {
  const users = await prisma.clientUser.findMany({
    where: { clientId },
    select: { id: true, isActive: true },
  });

  return {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.isActive).length,
    hasPortalAccess: users.some((user) => user.isActive),
  };
}

export async function createClientUserAction(
  clientId: string,
  _prevState: ClientUserActionState,
  formData: FormData,
): Promise<ClientUserActionState> {
  const parsed = clientUserFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  if (!parsed.data.password) {
    return { fieldErrors: { password: "Password is required" } };
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return { error: "Client not found" };
  }

  const existing = await prisma.clientUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existing) {
    return { fieldErrors: { email: "A portal user with this email already exists" } };
  }

  await prisma.clientUser.create({
    data: {
      clientId,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  revalidateClientUserPaths(clientId);
  return { success: true };
}

export async function setClientUserActiveAction(
  clientUserId: string,
  isActive: boolean,
): Promise<ClientUserActionState> {
  const clientUser = await prisma.clientUser.findUnique({
    where: { id: clientUserId },
  });

  if (!clientUser) {
    return { error: "Portal user not found" };
  }

  await prisma.clientUser.update({
    where: { id: clientUserId },
    data: { isActive },
  });

  revalidateClientUserPaths(clientUser.clientId);
  return { success: true };
}
