"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  hideAllProjectTasksFromClientAction,
  setProjectClientVisibleAction,
} from "@/actions/client-sharing-mutations";
import { ClientVisibilityBadge } from "@/components/client-sharing/client-visibility-badge";
import { Button } from "@/components/ui/button";

export function ProjectClientSharingPanel({
  projectId,
  clientVisible,
  clientSummary,
  clientStatusNote,
}: {
  projectId: string;
  clientVisible: boolean;
  clientSummary: string | null;
  clientStatusNote: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleVisible(next: boolean) {
    startTransition(async () => {
      const result = await setProjectClientVisibleAction(projectId, next);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function hideAllTasks() {
    startTransition(async () => {
      const result = await hideAllProjectTasksFromClientAction(projectId);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <ClientVisibilityBadge visible={clientVisible} />
      </div>

      {clientSummary ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Client Summary
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{clientSummary}</p>
        </div>
      ) : null}

      {clientStatusNote ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Client Status Note
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{clientStatusNote}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={clientVisible ? "secondary" : "primary"}
          disabled={pending}
          onClick={() => toggleVisible(!clientVisible)}
        >
          {clientVisible ? "Hide from Client" : "Make visible to Client"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={hideAllTasks}
        >
          Hide all project tasks
        </Button>
      </div>
    </div>
  );
}
