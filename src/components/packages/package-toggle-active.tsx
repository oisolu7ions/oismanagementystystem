"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { togglePackageActiveAction } from "@/actions/packages";
import { Button } from "@/components/ui/button";

export function PackageToggleActive({
  packageId,
  isActive,
}: {
  packageId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await togglePackageActiveAction(packageId, !isActive);
          if (result?.error) {
            alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      {pending ? "Updating..." : isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
