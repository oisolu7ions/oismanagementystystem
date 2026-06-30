"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cancelClientUpdateRequestAction } from "@/actions/client-update-request-mutations";
import { Button } from "@/components/ui/button";

export function CancelClientUpdateRequestButton({
  updateRequestId,
}: {
  updateRequestId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() => {
        if (!confirm("Cancel this update request?")) return;
        startTransition(async () => {
          const result = await cancelClientUpdateRequestAction(updateRequestId);
          if (result.error) {
            alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      {pending ? "Cancelling..." : "Cancel request"}
    </Button>
  );
}
