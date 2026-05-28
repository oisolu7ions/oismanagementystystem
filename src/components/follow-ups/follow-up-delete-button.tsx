"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteFollowUpAction } from "@/actions/follow-up-mutations";
import { Button } from "@/components/ui/button";

export function FollowUpDeleteButton({
  followUpId,
  label,
}: {
  followUpId: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Delete follow-up "${label}"? This cannot be undone.`)) {
          return;
        }

        startTransition(async () => {
          const result = await deleteFollowUpAction(followUpId);
          if (result?.error) {
            alert(result.error);
            return;
          }
          if (result?.success) {
            router.push("/dashboard/follow-ups");
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
