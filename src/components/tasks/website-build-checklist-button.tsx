"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { addWebsiteBuildChecklistAction } from "@/actions/task-mutations";
import { Button } from "@/components/ui/button";

export function WebsiteBuildChecklistButton({
  projectId,
  disabled,
}: {
  projectId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={disabled || pending}
      onClick={() => {
        if (
          !window.confirm(
            "Add the website build checklist to this project? Existing tasks with the same titles will be skipped.",
          )
        ) {
          return;
        }

        startTransition(async () => {
          const result = await addWebsiteBuildChecklistAction(projectId);
          if (result.error) {
            alert(result.error);
            return;
          }
          if (result.message) {
            alert(result.message);
          }
          router.refresh();
        });
      }}
    >
      {pending ? "Adding..." : "Add Website Build Checklist"}
    </Button>
  );
}
