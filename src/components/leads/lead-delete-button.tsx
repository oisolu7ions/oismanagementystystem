"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteLeadAction } from "@/actions/leads";
import { Button } from "@/components/ui/button";

export function LeadDeleteButton({
  leadId,
  leadName,
}: {
  leadId: string;
  leadName: string;
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
        if (!window.confirm(`Delete lead "${leadName}"? This cannot be undone.`)) {
          return;
        }

        startTransition(async () => {
          const result = await deleteLeadAction(leadId);
          if (result?.error) {
            alert(result.error);
            return;
          }
          if (result?.success) {
            router.push("/dashboard/leads");
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
