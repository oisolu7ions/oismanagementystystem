"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateFollowUpStatusAction } from "@/actions/follow-up-mutations";
import type { FollowUpStatusValue } from "@/lib/follow-ups/constants";
import { Button } from "@/components/ui/button";

export function FollowUpStatusActions({
  followUpId,
  currentStatus,
}: {
  followUpId: string;
  currentStatus: FollowUpStatusValue;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setStatus(status: "COMPLETED" | "MISSED" | "CANCELLED" | "PENDING") {
    startTransition(async () => {
      const result = await updateFollowUpStatusAction(followUpId, status);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currentStatus !== "COMPLETED" ? (
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => setStatus("COMPLETED")}
        >
          Mark as Completed
        </Button>
      ) : null}
      {currentStatus !== "MISSED" && currentStatus !== "CANCELLED" ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => setStatus("MISSED")}
        >
          Mark as Missed
        </Button>
      ) : null}
      {currentStatus !== "CANCELLED" && currentStatus !== "COMPLETED" ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (!window.confirm("Cancel this follow-up?")) return;
            setStatus("CANCELLED");
          }}
        >
          Mark as Cancelled
        </Button>
      ) : null}
      {currentStatus !== "PENDING" ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => setStatus("PENDING")}
        >
          Reopen as Pending
        </Button>
      ) : null}
    </div>
  );
}
