"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteClientAction } from "@/actions/client-mutations";
import { Button } from "@/components/ui/button";

export function ClientDeleteButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
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
        if (!window.confirm(`Delete client "${clientName}"? This cannot be undone.`)) {
          return;
        }

        startTransition(async () => {
          const result = await deleteClientAction(clientId);
          if (result?.error) {
            alert(result.error);
            return;
          }
          if (result?.success) {
            router.push("/dashboard/clients");
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
