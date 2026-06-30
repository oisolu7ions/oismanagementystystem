"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateActivityClientSharingAction } from "@/actions/client-sharing-mutations";
import { ActivityTypeBadge } from "@/components/activity/activity-type-badge";
import { ClientVisibilityBadge } from "@/components/client-sharing/client-visibility-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ActivityRecord } from "@/actions/activity";
import { Clock } from "lucide-react";

export function ActivityAdminTimeline({
  activities,
}: {
  activities: ActivityRecord[];
}) {
  if (activities.length === 0) {
    return <p className="text-sm text-slate-500">No activity recorded yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {activities.map((activity) => (
        <ActivityAdminItem key={activity.id} activity={activity} />
      ))}
    </ol>
  );
}

function ActivityAdminItem({ activity }: { activity: ActivityRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [clientVisible, setClientVisible] = useState(activity.clientVisible);

  function saveSharing(formData: FormData) {
    startTransition(async () => {
      const result = await updateActivityClientSharingAction(activity.id, formData);
      if (result.error) {
        alert(result.error);
        return;
      }
      setClientVisible(formData.get("clientVisible") === "true");
      router.refresh();
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveSharing(new FormData(event.currentTarget));
  }

  function shareWithClient(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (form) {
      const input = form.querySelector('input[name="clientVisible"]') as HTMLInputElement | null;
      if (input) input.value = "true";
    }
  }

  return (
    <li className="relative rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <ActivityTypeBadge type={activity.type} />
        <ClientVisibilityBadge visible={clientVisible} />
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          {activity.createdAt.toLocaleString()}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-800">
        <span className="font-medium text-slate-500">Internal: </span>
        {activity.message}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg bg-slate-50 p-3">
        <input type="hidden" name="clientVisible" value={clientVisible ? "true" : "false"} />
        <Textarea
          label="Client Update Message"
          name="clientMessage"
          rows={2}
          defaultValue={activity.clientMessage ?? ""}
          placeholder="Safe message shown to the client if shared."
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={pending}
            onClick={shareWithClient}
          >
            {clientVisible ? "Save client update" : "Share with client"}
          </Button>
          {clientVisible ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => {
                const data = new FormData();
                data.set("clientVisible", "false");
                data.set("clientMessage", "");
                saveSharing(data);
              }}
            >
              Hide from client
            </Button>
          ) : null}
        </div>
      </form>
    </li>
  );
}
