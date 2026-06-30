"use client";

import { useActionState } from "react";
import type { TaskActionState } from "@/lib/tasks/action-state";
import {
  taskPriorityOptions,
  taskStatusOptions,
} from "@/lib/tasks/constants";
import type { TaskFormInput } from "@/lib/validators/task";
import { TaskClientSharingFields } from "@/components/client-sharing/client-sharing-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProjectOption = {
  id: string;
  name: string;
  client: { id: string; name: string; businessName: string | null };
};

type TaskFormAction = (
  prevState: TaskActionState,
  formData: FormData,
) => Promise<TaskActionState>;

type TaskFormProps = {
  mode: "create" | "edit";
  action: TaskFormAction;
  projects: ProjectOption[];
  initialValues?: Partial<TaskFormInput>;
  lockProjectId?: boolean;
};

const initialState: TaskActionState = {};

function projectLabel(project: ProjectOption) {
  const client = project.client.businessName
    ? `${project.client.name} — ${project.client.businessName}`
    : project.client.name;
  return `${project.name} (${client})`;
}

export function TaskForm({
  mode,
  action,
  projects,
  initialValues,
  lockProjectId = false,
}: TaskFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const status = initialValues?.status ?? "TODO";
  const priority = initialValues?.priority ?? "MEDIUM";
  const projectId = initialValues?.projectId ?? "";

  const selectClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <form action={formAction} className="space-y-5">
      <Input
        label="Title"
        name="title"
        defaultValue={initialValues?.title ?? ""}
        placeholder="e.g. Create homepage"
        required
        error={state.fieldErrors?.title}
      />

      <div className="space-y-1.5">
        <label htmlFor="projectId" className="block text-sm font-medium text-slate-700">
          Project
        </label>
        {lockProjectId && projectId ? (
          <>
            <input type="hidden" name="projectId" value={projectId} />
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
              {projects.find((p) => p.id === projectId)
                ? projectLabel(projects.find((p) => p.id === projectId)!)
                : "Selected project"}
            </p>
          </>
        ) : (
          <select
            id="projectId"
            name="projectId"
            defaultValue={projectId}
            required
            className={selectClass}
          >
            <option value="" disabled>
              Select a project
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {projectLabel(project)}
              </option>
            ))}
          </select>
        )}
        {state.fieldErrors?.projectId ? (
          <p className="text-xs text-red-600">{state.fieldErrors.projectId}</p>
        ) : null}
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
            {taskStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-slate-700"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={priority}
            className={selectClass}
          >
            {taskPriorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Due date"
        name="dueDate"
        type="date"
        defaultValue={initialValues?.dueDate ?? ""}
      />

      <Textarea
        label="Description"
        name="description"
        rows={5}
        defaultValue={initialValues?.description ?? ""}
        placeholder="Steps, acceptance criteria, links, or notes..."
      />

      <TaskClientSharingFields initialValues={initialValues} />

      {state.error && !state.fieldErrors ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Saving..."
          : mode === "create"
            ? "Create task"
            : "Save changes"}
      </Button>
    </form>
  );
}
