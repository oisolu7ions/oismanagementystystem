"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { UpdateRequestActionState } from "@/lib/update-requests/action-state";
import {
  updateRequestPriorityOptions,
  updateRequestTypeOptions,
} from "@/lib/update-requests/constants";
import type { UpdateRequestClientFormInput } from "@/lib/validators/update-request";
import { UpdateRequestAttachmentsFields } from "@/components/update-requests/update-request-attachments-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProjectOption = { id: string; name: string };

type ClientUpdateRequestFormAction = (
  prevState: UpdateRequestActionState,
  formData: FormData,
) => Promise<UpdateRequestActionState>;

type ClientUpdateRequestFormProps = {
  mode: "create" | "edit";
  action: ClientUpdateRequestFormAction;
  projects: ProjectOption[];
  initialValues?: Partial<UpdateRequestClientFormInput>;
};

const initialState: UpdateRequestActionState = {};

export function ClientUpdateRequestForm({
  mode,
  action,
  projects,
  initialValues,
}: ClientUpdateRequestFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <Input
        label="What do you need updated?"
        name="title"
        required
        defaultValue={initialValues?.title ?? ""}
        placeholder="Update homepage service descriptions"
        error={state.fieldErrors?.title}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Which project is this for?
        </label>
        <select
          name="projectId"
          defaultValue={initialValues?.projectId ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">General / not project-specific</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {state.fieldErrors?.projectId ? (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.projectId}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      <Textarea
        label="Describe the change"
        name="description"
        rows={6}
        required
        defaultValue={initialValues?.description ?? ""}
        placeholder="Tell us exactly what should change, where it should appear, and any deadlines."
        error={state.fieldErrors?.description}
      />

      <UpdateRequestAttachmentsFields showHelp />

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : mode === "create" ? "Submit request" : "Save changes"}
      </Button>
    </form>
  );
}
