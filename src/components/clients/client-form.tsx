"use client";

import { useActionState } from "react";
import type { ClientActionState } from "@/lib/clients/action-state";
import { clientStatusOptions } from "@/lib/clients/constants";
import type { ClientFormInput } from "@/lib/validators/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PackageOption = {
  id: string;
  name: string;
  isActive: boolean;
};

type ClientFormAction = (
  prevState: ClientActionState,
  formData: FormData,
) => Promise<ClientActionState>;

type ClientFormProps = {
  mode: "create" | "edit";
  action: ClientFormAction;
  packages: PackageOption[];
  initialValues?: Partial<ClientFormInput>;
};

const initialState: ClientActionState = {};

export function ClientForm({
  mode,
  action,
  packages,
  initialValues,
}: ClientFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const status = initialValues?.status ?? "ACTIVE";
  const selectClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Name"
          name="name"
          defaultValue={initialValues?.name ?? ""}
          placeholder="Primary contact name"
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
          error={state.fieldErrors?.email}
        />
        <Input
          label="Phone"
          name="phone"
          defaultValue={initialValues?.phone ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Website"
          name="website"
          defaultValue={initialValues?.website ?? ""}
          placeholder="https://example.com"
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
            {clientStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Textarea
        label="Address"
        name="address"
        rows={3}
        defaultValue={initialValues?.address ?? ""}
        placeholder="Street, city, state, postal code"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="packageId" className="block text-sm font-medium text-slate-700">
            OIS package
          </label>
          <select
            id="packageId"
            name="packageId"
            defaultValue={initialValues?.packageId ?? ""}
            className={selectClass}
          >
            <option value="">No package assigned</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
                {!pkg.isActive ? " (inactive)" : ""}
              </option>
            ))}
          </select>
          {state.fieldErrors?.packageId ? (
            <p className="text-xs text-red-600">{state.fieldErrors.packageId}</p>
          ) : (
            <p className="text-xs text-slate-500">
              Only active packages are selectable unless already assigned.
            </p>
          )}
        </div>
        <Input
          label="Monthly plan"
          name="monthlyPlan"
          defaultValue={initialValues?.monthlyPlan ?? ""}
          placeholder="e.g. Growth hosting + support"
        />
      </div>

      <Input
        label="Monthly amount"
        name="monthlyAmount"
        defaultValue={initialValues?.monthlyAmount ?? ""}
        placeholder='e.g. $65/month or "Custom quote"'
      />

      <Textarea
        label="Notes"
        name="notes"
        rows={5}
        defaultValue={initialValues?.notes ?? ""}
        placeholder="Account notes, billing preferences, key contacts..."
      />

      {state.error && !state.fieldErrors ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : mode === "create" ? "Create client" : "Save changes"}
      </Button>
    </form>
  );
}
