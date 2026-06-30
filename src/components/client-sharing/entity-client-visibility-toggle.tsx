"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  setDocumentClientVisibleAction,
  setInvoiceClientVisibleAction,
  setTaskClientVisibleAction,
} from "@/actions/client-sharing-mutations";
import { ClientVisibilityBadge } from "@/components/client-sharing/client-visibility-badge";
import { Button } from "@/components/ui/button";

export function EntityClientVisibilityToggle({
  entityType,
  entityId,
  clientVisible,
  clientNote,
  noteLabel = "Client Note",
}: {
  entityType: "task" | "invoice" | "document";
  entityId: string;
  clientVisible: boolean;
  clientNote?: string | null;
  noteLabel?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleVisible(next: boolean) {
    startTransition(async () => {
      const action =
        entityType === "task"
          ? setTaskClientVisibleAction
          : entityType === "invoice"
            ? setInvoiceClientVisibleAction
            : setDocumentClientVisibleAction;

      const result = await action(entityId, next);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <ClientVisibilityBadge visible={clientVisible} />
      {clientNote ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {noteLabel}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{clientNote}</p>
        </div>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant={clientVisible ? "secondary" : "primary"}
        disabled={pending}
        onClick={() => toggleVisible(!clientVisible)}
      >
        {clientVisible ? "Hide from Client" : "Make visible to Client"}
      </Button>
    </div>
  );
}
