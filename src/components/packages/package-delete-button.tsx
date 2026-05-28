"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deletePackageAction } from "@/actions/packages";
import { Button } from "@/components/ui/button";

export function PackageDeleteButton({
  packageId,
  packageName,
}: {
  packageId: string;
  packageName: string;
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
        const confirmed = window.confirm(
          `Delete "${packageName}"? This cannot be undone.`,
        );
        if (!confirmed) return;

        startTransition(async () => {
          const result = await deletePackageAction(packageId);
          if (result?.error) {
            alert(result.error);
            return;
          }
          if (result?.success) {
            router.push("/dashboard/packages");
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
