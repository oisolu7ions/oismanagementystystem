"use client";

import { useActionState } from "react";
import type { ProjectActionState } from "@/lib/projects/action-state";
import {
  projectStatusOptions,
  serviceTypeOptions,
} from "@/lib/projects/constants";
import type { ProjectFormInput } from "@/lib/validators/project";
import { ProjectClientSharingFields } from "@/components/client-sharing/client-sharing-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ClientOption = {
  id: string;
  name: string;
  businessName: string | null;
};

type PackageOption = {
  id: string;
  name: string;
  isActive: boolean;
};

type ProjectFormAction = (
  prevState: ProjectActionState,
  formData: FormData,
) => Promise<ProjectActionState>;

type ProjectFormProps = {
  mode: "create" | "edit";
  action: ProjectFormAction;
  clients: ClientOption[];
  packages: PackageOption[];
  initialValues?: Partial<ProjectFormInput>;
  lockClientId?: boolean;
};

const initialState: ProjectActionState = {};

function clientLabel(client: ClientOption) {
  return client.businessName
    ? `${client.name} — ${client.businessName}`
    : client.name;
}

export function ProjectForm({
  mode,
  action,
  clients,
  packages,
  initialValues,
  lockClientId = false,
}: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const status = initialValues?.status ?? "NOT_STARTED";
  const serviceType = initialValues?.serviceType ?? "WEBSITE_BUILD";
  const clientId = initialValues?.clientId ?? "";

  const selectClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <form action={formAction} className="space-y-5">
      <Input
        label="Project name"
        name="name"
        defaultValue={initialValues?.name ?? ""}
        placeholder="e.g. Acme Corp website build"
        required
        error={state.fieldErrors?.name}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="clientId" className="block text-sm font-medium text-slate-700">
            Client
          </label>
          {lockClientId && clientId ? (
            <>
              <input type="hidden" name="clientId" value={clientId} />
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                {clients.find((c) => c.id === clientId)
                  ? clientLabel(clients.find((c) => c.id === clientId)!)
                  : "Selected client"}
              </p>
            </>
          ) : (
            <select
              id="clientId"
              name="clientId"
              defaultValue={clientId}
              required
              className={selectClass}
            >
              <option value="" disabled>
                Select a client
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {clientLabel(client)}
                </option>
              ))}
            </select>
          )}
          {state.fieldErrors?.clientId ? (
            <p className="text-xs text-red-600">{state.fieldErrors.clientId}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="serviceType"
            className="block text-sm font-medium text-slate-700"
          >
            Service type
          </label>
          <select
            id="serviceType"
            name="serviceType"
            defaultValue={serviceType}
            className={selectClass}
          >
            {serviceTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.serviceType ? (
            <p className="text-xs text-red-600">{state.fieldErrors.serviceType}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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
            {projectStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

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
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Price"
          name="price"
          defaultValue={initialValues?.price ?? ""}
          placeholder='e.g. Starting at $1,499 or "Custom quote"'
        />
        <Input
          label="Monthly fee"
          name="monthlyFee"
          defaultValue={initialValues?.monthlyFee ?? ""}
          placeholder='e.g. $65/month or "Custom quote"'
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Start date"
          name="startDate"
          type="date"
          defaultValue={initialValues?.startDate ?? ""}
        />
        <Input
          label="Due date"
          name="dueDate"
          type="date"
          defaultValue={initialValues?.dueDate ?? ""}
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        rows={5}
        defaultValue={initialValues?.description ?? ""}
        placeholder="Scope, deliverables, milestones, and client expectations..."
      />

      <ProjectClientSharingFields initialValues={initialValues} />

      {state.error && !state.fieldErrors ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Saving..."
          : mode === "create"
            ? "Create project"
            : "Save changes"}
      </Button>
    </form>
  );
}
