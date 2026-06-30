"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { UpdateRequestActionState } from "@/lib/update-requests/action-state";
import {
  updateRequestPriorityOptions,
  updateRequestStatusOptions,
  updateRequestTypeOptions,
} from "@/lib/update-requests/constants";
import type { UpdateRequestAdminFormInput } from "@/lib/validators/update-request";
import { UpdateRequestAttachmentsFields } from "@/components/update-requests/update-request-attachments-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ClientOption = { id: string; name: string; businessName: string | null };
type ProjectOption = { id: string; name: string; clientId: string };

type UpdateRequestFormAction = (
  prevState: UpdateRequestActionState,
  formData: FormData,
) => Promise<UpdateRequestActionState>;

type UpdateRequestFormProps = {
  mode: "create" | "edit";
  action: UpdateRequestFormAction;
  clients: ClientOption[];
  projects: ProjectOption[];
  initialValues?: Partial<UpdateRequestAdminFormInput>;
  lockClientId?: boolean;
  lockProjectId?: boolean;
};

const initialState: UpdateRequestActionState = {};

function entityLabel(name: string, businessName: string | null) {
  return businessName ? `${name} — ${businessName}` : name;
}

export function UpdateRequestForm({
  mode,
  action,
  clients,
  projects,
  initialValues,
  lockClientId = false,
  lockProjectId = false,
}: UpdateRequestFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientId, setClientId] = useState(initialValues?.clientId ?? "");

  const filteredProjects = clientId
    ? projects.filter((project) => project.clientId === clientId)
    : projects;

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Client</label>
          <select
            name="clientId"
            required
            disabled={lockClientId}
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {entityLabel(client.name, client.businessName)}
              </option>
            ))}
          </select>
          {state.fieldErrors?.clientId ? (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.clientId}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Which project is this for?
          </label>
          <select
            name="projectId"
            disabled={lockProjectId || !clientId}
            defaultValue={initialValues?.projectId ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">No specific project</option>
            {filteredProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.projectId ? (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.projectId}</p>
          ) : null}
        </div>
      </div>

      <Input
        label="What do you need updated?"
        name="title"
        required
        defaultValue={initialValues?.title ?? ""}
        placeholder="Change homepage photos"
        error={state.fieldErrors?.title}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Request type</label>
          <select
            name="requestType"
            required
            defaultValue={initialValues?.requestType ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select type</option>
            {updateRequestTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.requestType ? (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.requestType}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
          <select
            name="priority"
            defaultValue={initialValues?.priority ?? "NORMAL"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {updateRequestPriorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Request status</label>
          <select
            name="status"
            defaultValue={initialValues?.status ?? "SUBMITTED"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {updateRequestStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Textarea
        label="Describe the change"
        name="description"
        rows={5}
        required
        defaultValue={initialValues?.description ?? ""}
        placeholder="Please update the homepage hero section with the new photos attached."
        error={state.fieldErrors?.description}
      />

      <Textarea
        label="Internal admin notes"
        name="adminNotes"
        rows={3}
        defaultValue={initialValues?.adminNotes ?? ""}
        placeholder="Internal notes — not visible to the client."
      />

      <Textarea
        label="OIS response"
        name="clientVisibleResponse"
        rows={3}
        defaultValue={initialValues?.clientVisibleResponse ?? ""}
        placeholder="Safe response shown to the client in their portal."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Estimated price"
          name="estimatedPrice"
          defaultValue={initialValues?.estimatedPrice ?? ""}
          placeholder="$250"
        />
        <Input
          label="Approved price"
          name="approvedPrice"
          defaultValue={initialValues?.approvedPrice ?? ""}
          placeholder="$250"
        />
        <Input
          label="Due date"
          name="dueDate"
          type="date"
          defaultValue={initialValues?.dueDate ?? ""}
        />
      </div>

      <UpdateRequestAttachmentsFields />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : mode === "create" ? "Create request" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
