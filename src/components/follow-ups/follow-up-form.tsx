"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { FollowUpActionState } from "@/lib/follow-ups/action-state";
import {
  followUpReasonOptions,
  followUpStatusOptions,
} from "@/lib/follow-ups/constants";
import type { FollowUpFormInput } from "@/lib/validators/follow-up";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type LeadOption = { id: string; name: string; businessName: string | null };
type ClientOption = { id: string; name: string; businessName: string | null };

type FollowUpFormAction = (
  prevState: FollowUpActionState,
  formData: FormData,
) => Promise<FollowUpActionState>;

type FollowUpFormProps = {
  mode: "create" | "edit";
  action: FollowUpFormAction;
  leads: LeadOption[];
  clients: ClientOption[];
  initialValues?: Partial<FollowUpFormInput>;
  lockLeadId?: boolean;
  lockClientId?: boolean;
};

const initialState: FollowUpActionState = {};

function entityLabel(name: string, businessName: string | null) {
  return businessName ? `${name} — ${businessName}` : name;
}

export function FollowUpForm({
  mode,
  action,
  leads,
  clients,
  initialValues,
  lockLeadId = false,
  lockClientId = false,
}: FollowUpFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const initialLinkType = initialValues?.leadId
    ? "lead"
    : initialValues?.clientId
      ? "client"
      : "lead";

  const [linkType, setLinkType] = useState<"lead" | "client">(initialLinkType);
  const [leadId, setLeadId] = useState(initialValues?.leadId ?? "");
  const [clientId, setClientId] = useState(initialValues?.clientId ?? "");

  const status = initialValues?.status ?? "PENDING";
  const reason = initialValues?.reason ?? "OTHER";

  const selectClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  const locked = lockLeadId || lockClientId;

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="reason" className="block text-sm font-medium text-slate-700">
          Reason
        </label>
        <select
          id="reason"
          name="reason"
          defaultValue={reason}
          required
          className={selectClass}
        >
          {followUpReasonOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.reason ? (
          <p className="text-xs text-red-600">{state.fieldErrors.reason}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Follow-up date"
          name="followUpDate"
          type="date"
          defaultValue={initialValues?.followUpDate ?? ""}
          required
          error={state.fieldErrors?.followUpDate}
        />
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className={selectClass}
          >
            {followUpStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-800">Related to</p>

        {!locked ? (
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="linkTypeUi"
                checked={linkType === "lead"}
                onChange={() => {
                  setLinkType("lead");
                  setClientId("");
                }}
              />
              Lead
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="linkTypeUi"
                checked={linkType === "client"}
                onChange={() => {
                  setLinkType("client");
                  setLeadId("");
                }}
              />
              Client
            </label>
          </div>
        ) : null}

        {lockLeadId && leadId ? (
          <>
            <input type="hidden" name="leadId" value={leadId} />
            <p className="text-sm text-slate-700">
              Lead:{" "}
              {leads.find((l) => l.id === leadId)
                ? entityLabel(
                    leads.find((l) => l.id === leadId)!.name,
                    leads.find((l) => l.id === leadId)!.businessName,
                  )
                : "Selected lead"}
            </p>
          </>
        ) : lockClientId && clientId ? (
          <>
            <input type="hidden" name="clientId" value={clientId} />
            <p className="text-sm text-slate-700">
              Client:{" "}
              {clients.find((c) => c.id === clientId)
                ? entityLabel(
                    clients.find((c) => c.id === clientId)!.name,
                    clients.find((c) => c.id === clientId)!.businessName,
                  )
                : "Selected client"}
            </p>
          </>
        ) : linkType === "lead" ? (
          <div className="space-y-1.5">
            <label htmlFor="leadId" className="block text-sm font-medium text-slate-700">
              Lead
            </label>
            <select
              id="leadId"
              name="leadId"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className={selectClass}
            >
              <option value="">Select a lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {entityLabel(lead.name, lead.businessName)}
                </option>
              ))}
            </select>
            <input type="hidden" name="clientId" value="" />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label
              htmlFor="clientId"
              className="block text-sm font-medium text-slate-700"
            >
              Client
            </label>
            <select
              id="clientId"
              name="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className={selectClass}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {entityLabel(client.name, client.businessName)}
                </option>
              ))}
            </select>
            <input type="hidden" name="leadId" value="" />
          </div>
        )}

        {state.fieldErrors?.leadId ? (
          <p className="text-xs text-red-600">{state.fieldErrors.leadId}</p>
        ) : null}
        {state.fieldErrors?.clientId ? (
          <p className="text-xs text-red-600">{state.fieldErrors.clientId}</p>
        ) : null}
      </div>

      <Textarea
        label="Notes"
        name="notes"
        rows={4}
        defaultValue={initialValues?.notes ?? ""}
        placeholder="What to cover on the call or email..."
      />

      <p className="text-xs text-slate-500">
        Manual tracking only — automated reminders and calendar sync come in a
        later phase.
      </p>

      {state.error && !state.fieldErrors ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Saving..."
          : mode === "create"
            ? "Create follow-up"
            : "Save changes"}
      </Button>
    </form>
  );
}
