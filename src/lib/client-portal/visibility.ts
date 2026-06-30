import type { Prisma } from "@/generated/prisma/client";
import { CLIENT_VISIBLE_INVOICE_STATUSES } from "@/lib/auth/client-constants";

export function clientVisibleProjectWhere(clientId: string): Prisma.ProjectWhereInput {
  return {
    clientId,
    clientVisible: true,
    status: { notIn: ["CANCELLED"] },
  };
}

export function clientVisibleTaskWhere(clientId: string): Prisma.TaskWhereInput {
  return {
    clientVisible: true,
    project: {
      clientId,
      clientVisible: true,
      status: { notIn: ["CANCELLED"] },
    },
  };
}

export function clientVisibleInvoiceWhere(clientId: string): Prisma.InvoiceWhereInput {
  return {
    clientId,
    clientVisible: true,
    status: { in: [...CLIENT_VISIBLE_INVOICE_STATUSES] },
  };
}

export function clientVisibleDocumentWhere(clientId: string): Prisma.DocumentLinkWhereInput {
  return {
    clientVisible: true,
    OR: [
      { clientId },
      {
        project: {
          clientId,
          clientVisible: true,
        },
      },
    ],
  };
}

export function clientVisibleActivityWhere(clientId: string): Prisma.ActivityWhereInput {
  return {
    clientVisible: true,
    OR: [
      { clientId },
      {
        project: {
          clientId,
          clientVisible: true,
        },
      },
    ],
  };
}

const DEFAULT_CLIENT_ACTIVITY_MESSAGE = "Your project has been updated.";

export function getClientSafeActivityMessage(activity: {
  clientMessage: string | null;
}): string {
  return activity.clientMessage?.trim() || DEFAULT_CLIENT_ACTIVITY_MESSAGE;
}
