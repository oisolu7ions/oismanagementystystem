import type { ActivityType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type LogActivityInput = {
  type: ActivityType;
  message: string;
  clientVisible?: boolean;
  clientMessage?: string | null;
  leadId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  invoiceId?: string | null;
  followUpId?: string | null;
  noteId?: string | null;
  documentLinkId?: string | null;
  updateRequestId?: string | null;
};

type TransactionClient = Prisma.TransactionClient;

export async function logActivity(
  input: LogActivityInput,
  tx?: TransactionClient,
) {
  const db = tx ?? prisma;

  return db.activity.create({
    data: {
      type: input.type,
      message: input.message,
      clientVisible: input.clientVisible ?? false,
      clientMessage: input.clientMessage ?? null,
      leadId: input.leadId ?? null,
      clientId: input.clientId ?? null,
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
      invoiceId: input.invoiceId ?? null,
      followUpId: input.followUpId ?? null,
      noteId: input.noteId ?? null,
      documentLinkId: input.documentLinkId ?? null,
      updateRequestId: input.updateRequestId ?? null,
    },
  });
}

export function formatLeadName(name: string, businessName?: string | null): string {
  return businessName ? `${name} (${businessName})` : name;
}
