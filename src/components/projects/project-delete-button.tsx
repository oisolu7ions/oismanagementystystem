"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProjectAction } from "@/actions/project-mutations";
import { Button } from "@/components/ui/button";

export function ProjectDeleteButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
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
        if (
          !window.confirm(
            `Delete project "${projectName}"? This cannot be undone.`,
          )
        ) {
          return;
        }

        startTransition(async () => {
          const result = await deleteProjectAction(projectId);
          if (result?.error) {
            alert(result.error);
            return;
          }
          if (result?.success) {
            router.push("/dashboard/projects");
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
