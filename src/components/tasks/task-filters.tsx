"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  taskPriorityOptions,
  taskStatusOptions,
} from "@/lib/tasks/constants";

type ProjectOption = {
  id: string;
  name: string;
  client: { id: string; name: string; businessName: string | null };
};

type ClientOption = {
  id: string;
  name: string;
  businessName: string | null;
};

export function TaskFilters({
  currentStatus,
  currentPriority,
  currentProjectId,
  currentClientId,
  projects,
  clients,
}: {
  currentStatus?: string;
  currentPriority?: string;
  currentProjectId?: string;
  currentClientId?: string;
  projects: ProjectOption[];
  clients: ClientOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const next = params.toString();
    router.replace(next ? `/dashboard/tasks?${next}` : "/dashboard/tasks");
  }

  const selectClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  function projectLabel(project: ProjectOption) {
    const client = project.client.businessName
      ? `${project.client.name} — ${project.client.businessName}`
      : project.client.name;
    return `${project.name} (${client})`;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-1.5">
        <label htmlFor="status" className="block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="status"
          value={currentStatus ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className={selectClass}
        >
          <option value="">All statuses</option>
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
          value={currentPriority ?? ""}
          onChange={(e) => updateParam("priority", e.target.value)}
          className={selectClass}
        >
          <option value="">All priorities</option>
          {taskPriorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="projectId" className="block text-sm font-medium text-slate-700">
          Project
        </label>
        <select
          id="projectId"
          value={currentProjectId ?? ""}
          onChange={(e) => updateParam("projectId", e.target.value)}
          className={selectClass}
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {projectLabel(project)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="clientId" className="block text-sm font-medium text-slate-700">
          Client
        </label>
        <select
          id="clientId"
          value={currentClientId ?? ""}
          onChange={(e) => updateParam("clientId", e.target.value)}
          className={selectClass}
        >
          <option value="">All clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
              {client.businessName ? ` — ${client.businessName}` : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
