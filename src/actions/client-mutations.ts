"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ClientActionState } from "@/lib/clients/action-state";
import { prisma } from "@/lib/prisma";
import { clientFormSchema, clientInputToDbFields } from "@/lib/validators/client";

function revalidateClientPaths(id?: string) {
  revalidatePath("/dashboard/clients");
  if (id) {
    revalidatePath(`/dashboard/clients/${id}`);
    revalidatePath(`/dashboard/clients/${id}/edit`);
  }
}

function formatZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): ClientActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

function parseClientFormData(formData: FormData) {
  return clientFormSchema.safeParse({
    name: formData.get("name"),
    businessName: formData.get("businessName") ?? undefined,
    email: formData.get("email") ?? undefined,
    phone: formData.get("phone") ?? undefined,
    website: formData.get("website") ?? undefined,
    address: formData.get("address") ?? undefined,
    status: formData.get("status") ?? "ACTIVE",
    packageId: formData.get("packageId") ?? undefined,
    monthlyPlan: formData.get("monthlyPlan") ?? undefined,
    monthlyAmount: formData.get("monthlyAmount") ?? undefined,
    notes: formData.get("notes") ?? undefined,
  });
}

async function validatePackageAssignment(
  packageId: string | null | undefined,
  currentPackageId?: string | null,
): Promise<string | null> {
  if (!packageId) return null;

  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) return "Selected package not found";
  if (!pkg.isActive && packageId !== currentPackageId) {
    return "Inactive packages cannot be assigned to new clients";
  }
  return null;
}

export async function createClientAction(
  _prevState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const parsed = parseClientFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const packageError = await validatePackageAssignment(parsed.data.packageId);
  if (packageError) {
    return { fieldErrors: { packageId: packageError } };
  }

  const client = await prisma.client.create({
    data: clientInputToDbFields(parsed.data),
  });

  revalidateClientPaths(client.id);
  redirect(`/dashboard/clients/${client.id}`);
}

export async function updateClientAction(
  id: string,
  _prevState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Client not found" };
  }

  const parsed = parseClientFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const packageError = await validatePackageAssignment(
    parsed.data.packageId,
    existing.packageId,
  );
  if (packageError) {
    return { fieldErrors: { packageId: packageError } };
  }

  await prisma.client.update({
    where: { id },
    data: clientInputToDbFields(parsed.data),
  });

  revalidateClientPaths(id);
  redirect(`/dashboard/clients/${id}`);
}

export async function deleteClientAction(
  id: string,
): Promise<ClientActionState & { success?: boolean }> {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      _count: { select: { projects: true, invoices: true } },
      lead: true,
    },
  });

  if (!client) {
    return { error: "Client not found" };
  }

  if (client._count.projects > 0 || client._count.invoices > 0) {
    return {
      error:
        "Cannot delete a client with linked projects or invoices. Set status to Inactive or Past Client instead.",
    };
  }

  await prisma.$transaction(async (tx) => {
    if (client.lead) {
      await tx.lead.update({
        where: { id: client.lead.id },
        data: { clientId: null, convertedAt: null },
      });
    }
    await tx.client.delete({ where: { id } });
  });

  revalidatePath("/dashboard/clients");
  return { success: true };
}
