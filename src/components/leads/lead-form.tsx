"use client";

import { useActionState } from "react";
import {
  createLeadAction,
  updateLeadAction,
  type LeadActionState,
} from "@/actions/leads";
import {
  followUpDateToInputValue,
  leadSourceOptions,
  leadStatusOptions,
} from "@/lib/leads/constants";
import type { LeadFormInput } from "@/lib/validators/lead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type LeadFormProps = {
  mode: "create" | "edit";
  leadId?: string;
  initialValues?: Partial<LeadFormInput & { followUpDate?: string }>;
};

const initialState: LeadActionState = {};

export function LeadForm({ mode, leadId, initialValues }: LeadFormProps) {
  const action =
    mode === "create"
      ? createLeadAction
      : updateLeadAction.bind(null, leadId!);

  const [state, formAction, pending] = useActionState(action, initialState);

  const status = initialValues?.status ?? "NEW";

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Name"
          name="name"
          defaultValue={initialValues?.name ?? ""}
          placeholder="Contact name"
          required
          error={state.fieldErrors?.name}
        />
        <Input
          label="Business name"
          name="businessName"
          defaultValue={initialValues?.businessName ?? ""}
          placeholder="Company or brand"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Email"
          name="email"
          type="email"
          defaultValue={initialValues?.email ?? ""}
          placeholder="email@example.com"
          error={state.fieldErrors?.email}
        />
        <Input
          label="Phone"
          name="phone"
          defaultValue={initialValues?.phone ?? ""}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Website"
          name="website"
          defaultValue={initialValues?.website ?? ""}
          placeholder="https://example.com"
        />
        <Input
          label="Industry"
          name="industry"
          defaultValue={initialValues?.industry ?? ""}
          placeholder="e.g. Healthcare, Retail"
        />
      </div>

      <Input
        label="Service interest"
        name="serviceInterest"
        defaultValue={initialValues?.serviceInterest ?? ""}
        placeholder="e.g. Growth package, custom dashboard"
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {leadStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="leadSource" className="block text-sm font-medium text-slate-700">
            Lead source
          </label>
          <select
            id="leadSource"
            name="leadSource"
            defaultValue={initialValues?.leadSource ?? ""}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Select source</option>
            {leadSourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Follow-up date"
          name="followUpDate"
          type="date"
          defaultValue={initialValues?.followUpDate ?? ""}
        />
      </div>

      <Textarea
        label="Notes"
        name="notes"
        rows={5}
        defaultValue={initialValues?.notes ?? ""}
        placeholder="Conversation notes, next steps, objections..."
      />

      {state.error && !state.fieldErrors ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : mode === "create" ? "Create lead" : "Save changes"}
      </Button>
    </form>
  );
}
