"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createTaskFromUpdateRequestAction } from "@/actions/update-request-mutations";
import { Button } from "@/components/ui/button";

export function CreateTaskFromUpdateRequestButton({
  updateRequestId,
  disabled,
}: {
  updateRequestId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      disabled={disabled || pending}
      onClick={() => {
        startTransition(async () => {
          const result = await createTaskFromUpdateRequestAction(updateRequestId);
          if (result.error) {
            alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      {pending ? "Creating..." : "Create Task from Request"}
    </Button>
  );
}
