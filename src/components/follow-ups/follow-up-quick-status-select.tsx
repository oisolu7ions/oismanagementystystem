"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateFollowUpStatusAction } from "@/actions/follow-up-mutations";
import type { FollowUpStatus } from "@/generated/prisma/client";
import {
  followUpStatusOptions,
  type FollowUpStatusValue,
} from "@/lib/follow-ups/constants";

export function FollowUpQuickStatusSelect({
  followUpId,
  currentStatus,
}: {
  followUpId: string;
  currentStatus: FollowUpStatusValue;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const selectClass =
    "block w-full min-w-[8.5rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60";

  return (
    <select
      aria-label="Update follow-up status"
      value={currentStatus}
      disabled={pending}
      className={selectClass}
      onChange={(event) => {
        const status = event.target.value as FollowUpStatus;
        startTransition(async () => {
          const result = await updateFollowUpStatusAction(followUpId, status);
          if (result.error) {
            alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      {followUpStatusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
