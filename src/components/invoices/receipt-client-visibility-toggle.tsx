"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setReceiptClientVisibleAction } from "@/actions/client-sharing-mutations";
import { ClientVisibilityBadge } from "@/components/client-sharing/client-visibility-badge";
import { Button } from "@/components/ui/button";

export function ReceiptClientVisibilityToggle({
  receiptId,
  clientVisible,
}: {
  receiptId: string;
  clientVisible: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleVisible(next: boolean) {
    startTransition(async () => {
      const result = await setReceiptClientVisibleAction(receiptId, next);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ClientVisibilityBadge visible={clientVisible} />
      <Button
        type="button"
        size="sm"
        variant={clientVisible ? "secondary" : "primary"}
        disabled={pending}
        onClick={() => toggleVisible(!clientVisible)}
      >
        {pending
          ? "Saving…"
          : clientVisible
            ? "Hide from client"
            : "Share with client"}
      </Button>
    </div>
  );
}
