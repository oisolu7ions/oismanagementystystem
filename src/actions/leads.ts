"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ClientStatus,
  LeadStatus,
  type LeadSource,
  type LeadStatus as LeadStatusType,
  type Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatLeadName, logActivity } from "@/lib/activity/log-activity";
import { revalidateActivityPaths } from "@/lib/activity/revalidate";
import { leadFormSchema, leadInputToDbFields } from "@/lib/validators/lead";

export type LeadActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export type LeadSearchParams = {
  q?: string;
  status?: string;
  source?: string;
};

function revalidateLeadPaths(id?: string) {
  revalidatePath("/dashboard/leads");
  if (id) {
    revalidatePath(`/dashboard/leads/${id}`);
    revalidatePath(`/dashboard/leads/${id}/edit`);
  }
}

function revalidateClientPaths(id?: string) {
  revalidatePath("/dashboard/clients");
  if (id) {
    revalidatePath(`/dashboard/clients/${id}`);
  }
}

function formatZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): LeadActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

function buildLeadWhere(params: LeadSearchParams): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};
  const q = params.q?.trim();

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { businessName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { serviceInterest: { contains: q, mode: "insensitive" } },
    ];
  }

  if (params.status) {
    where.status = params.status as LeadStatusType;
  }

  if (params.source) {
    where.leadSource = params.source as LeadSource;
  }

  return where;
}

function parseLeadFormData(formData: FormData) {
  return leadFormSchema.safeParse({
    name: formData.get("name"),
    businessName: formData.get("businessName") ?? undefined,
    email: formData.get("email") ?? undefined,
    phone: formData.get("phone") ?? undefined,
    website: formData.get("website") ?? undefined,
    industry: formData.get("industry") ?? undefined,
    serviceInterest: formData.get("serviceInterest") ?? undefined,
    leadSource: formData.get("leadSource") ?? undefined,
    status: formData.get("status") ?? "NEW",
    notes: formData.get("notes") ?? undefined,
    followUpDate: formData.get("followUpDate") ?? undefined,
  });
}

export async function searchLeads(params: LeadSearchParams = {}) {
  return prisma.lead.findMany({
    where: buildLeadWhere(params),
    orderBy: [{ followUpDate: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
    },
  });
}

export type ConvertLeadResult = {
  success?: boolean;
  error?: string;
  clientId?: string;
};

export async function convertLeadToClientAction(
  leadId: string,
): Promise<ConvertLeadResult> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });

  if (!lead) {
    return { error: "Lead not found." };
  }

  if (lead.clientId) {
    return { error: "This lead has already been converted to a client." };
  }

  try {
    const client = await prisma.$transaction(async (tx) => {
      const created = await tx.client.create({
        data: {
          name: lead.name,
          businessName: lead.businessName,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          notes: lead.notes,
          status: ClientStatus.ACTIVE,
        },
      });

      await tx.lead.update({
        where: { id: leadId },
        data: {
          clientId: created.id,
          status: LeadStatus.WON,
          convertedAt: new Date(),
        },
      });

      await logActivity(
        {
          type: "LEAD_CONVERTED",
          message: "Lead converted to client.",
          leadId,
          clientId: created.id,
        },
        tx,
      );

      await logActivity(
        {
          type: "CLIENT_CREATED",
          message: "Client profile created.",
          leadId,
          clientId: created.id,
        },
        tx,
      );

      return created;
    });

    revalidateLeadPaths(leadId);
    revalidateClientPaths(client.id);
    revalidateActivityPaths({ leadId, clientId: client.id });

    return { success: true, clientId: client.id };
  } catch {
    return {
      error: "Conversion failed. Please try again or contact support.",
    };
  }
}

export async function createLeadAction(
  _prevState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const parsed = parseLeadFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const lead = await prisma.lead.create({
    data: leadInputToDbFields(parsed.data),
  });

  await logActivity({
    type: "LEAD_CREATED",
    message: `Lead created for ${formatLeadName(lead.name, lead.businessName)}.`,
    leadId: lead.id,
  });

  revalidateLeadPaths(lead.id);
  revalidateActivityPaths({ leadId: lead.id });
  redirect(`/dashboard/leads/${lead.id}`);
}

export async function updateLeadAction(
  id: string,
  _prevState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const parsed = parseLeadFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: leadInputToDbFields(parsed.data),
  });

  await logActivity({
    type: "LEAD_UPDATED",
    message: `Lead updated for ${formatLeadName(lead.name, lead.businessName)}.`,
    leadId: lead.id,
    clientId: lead.clientId,
  });

  revalidateLeadPaths(id);
  revalidateActivityPaths({ leadId: id, clientId: lead.clientId });
  redirect(`/dashboard/leads/${id}`);
}

export async function deleteLeadAction(
  id: string,
): Promise<LeadActionState & { success?: boolean }> {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return { error: "Lead not found" };
  }

  await prisma.lead.delete({ where: { id } });
  revalidatePath("/dashboard/leads");
  return { success: true };
}
