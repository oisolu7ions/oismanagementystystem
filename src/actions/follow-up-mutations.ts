"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FollowUpStatus } from "@/generated/prisma/client";
import type { FollowUpActionState } from "@/lib/follow-ups/action-state";
import { prisma } from "@/lib/prisma";
import { followUpFormSchema, followUpInputToDbFields } from "@/lib/validators/follow-up";

function revalidateFollowUpPaths(
  followUpId?: string,
  leadId?: string | null,
  clientId?: string | null,
) {
  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard");
  if (followUpId) {
    revalidatePath(`/dashboard/follow-ups/${followUpId}`);
    revalidatePath(`/dashboard/follow-ups/${followUpId}/edit`);
  }
  if (leadId) {
    revalidatePath(`/dashboard/leads/${leadId}`);
  }
  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
}

function formatZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): FollowUpActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

function parseFollowUpFormData(formData: FormData) {
  return followUpFormSchema.safeParse({
    reason: formData.get("reason"),
    followUpDate: formData.get("followUpDate"),
    status: formData.get("status") ?? "PENDING",
    notes: formData.get("notes") ?? undefined,
    leadId: formData.get("leadId") ?? undefined,
    clientId: formData.get("clientId") ?? undefined,
  });
}

async function validateLeadExists(leadId: string): Promise<string | null> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return "Selected lead not found";
  return null;
}

async function validateClientExists(clientId: string): Promise<string | null> {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return "Selected client not found";
  return null;
}

export async function createFollowUpAction(
  _prevState: FollowUpActionState,
  formData: FormData,
): Promise<FollowUpActionState> {
  const parsed = parseFollowUpFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  if (parsed.data.leadId) {
    const leadError = await validateLeadExists(parsed.data.leadId);
    if (leadError) return { fieldErrors: { leadId: leadError } };
  }

  if (parsed.data.clientId) {
    const clientError = await validateClientExists(parsed.data.clientId);
    if (clientError) return { fieldErrors: { clientId: clientError } };
  }

  const followUp = await prisma.followUp.create({
    data: followUpInputToDbFields(parsed.data),
  });

  revalidateFollowUpPaths(followUp.id, followUp.leadId, followUp.clientId);
  redirect(`/dashboard/follow-ups/${followUp.id}`);
}

export async function updateFollowUpAction(
  id: string,
  _prevState: FollowUpActionState,
  formData: FormData,
): Promise<FollowUpActionState> {
  const existing = await prisma.followUp.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Follow-up not found" };
  }

  const parsed = parseFollowUpFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  if (parsed.data.leadId) {
    const leadError = await validateLeadExists(parsed.data.leadId);
    if (leadError) return { fieldErrors: { leadId: leadError } };
  }

  if (parsed.data.clientId) {
    const clientError = await validateClientExists(parsed.data.clientId);
    if (clientError) return { fieldErrors: { clientId: clientError } };
  }

  const fields = followUpInputToDbFields(parsed.data);

  const followUp = await prisma.followUp.update({
    where: { id },
    data: {
      ...fields,
      completedAt:
        fields.status === "COMPLETED"
          ? existing.completedAt ?? new Date()
          : fields.status === "PENDING"
            ? null
            : existing.completedAt,
    },
  });

  revalidateFollowUpPaths(id, followUp.leadId, followUp.clientId);
  if (existing.leadId !== followUp.leadId) {
    revalidateFollowUpPaths(undefined, existing.leadId, null);
  }
  if (existing.clientId !== followUp.clientId) {
    revalidateFollowUpPaths(undefined, null, existing.clientId);
  }

  redirect(`/dashboard/follow-ups/${id}`);
}

export async function deleteFollowUpAction(
  id: string,
): Promise<FollowUpActionState & { success?: boolean }> {
  const followUp = await prisma.followUp.findUnique({ where: { id } });
  if (!followUp) {
    return { error: "Follow-up not found" };
  }

  await prisma.followUp.delete({ where: { id } });
  revalidateFollowUpPaths(undefined, followUp.leadId, followUp.clientId);
  return { success: true };
}

export async function updateFollowUpStatusAction(
  followUpId: string,
  status: FollowUpStatus,
): Promise<FollowUpActionState & { success?: boolean }> {
  const followUp = await prisma.followUp.findUnique({ where: { id: followUpId } });
  if (!followUp) {
    return { error: "Follow-up not found" };
  }

  await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? followUp.completedAt ?? new Date() : null,
    },
  });

  revalidateFollowUpPaths(followUpId, followUp.leadId, followUp.clientId);
  return { success: true };
}
