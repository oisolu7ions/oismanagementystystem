"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteTaskAction } from "@/actions/task-mutations";
import { Button } from "@/components/ui/button";

export function TaskDeleteButton({
  taskId,
  taskTitle,
  redirectTo = "/dashboard/tasks",
}: {
  taskId: string;
  taskTitle: string;
  redirectTo?: string;
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
        if (!window.confirm(`Delete task "${taskTitle}"? This cannot be undone.`)) {
          return;
        }

        startTransition(async () => {
          const result = await deleteTaskAction(taskId);
          if (result?.error) {
            alert(result.error);
            return;
          }
          if (result?.success) {
            router.push(redirectTo);
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
