"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  updateRequestPriorityOptions,
  updateRequestStatusOptions,
  updateRequestTypeOptions,
} from "@/lib/update-requests/constants";

type ClientOption = { id: string; name: string; businessName: string | null };
type ProjectOption = { id: string; name: string; clientId: string };

export function UpdateRequestFilters({
  currentStatus,
  currentPriority,
  currentRequestType,
  currentClientId,
  currentProjectId,
  clients,
  projects,
}: {
  currentStatus?: string;
  currentPriority?: string;
  currentRequestType?: string;
  currentClientId?: string;
  currentProjectId?: string;
  clients: ClientOption[];
  projects: ProjectOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "clientId") params.delete("projectId");
    router.push(`/dashboard/update-requests?${params.toString()}`);
  }

  const filteredProjects = currentClientId
    ? projects.filter((project) => project.clientId === currentClientId)
    : projects;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <select
        value={currentStatus ?? ""}
        onChange={(event) => updateParam("status", event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">All statuses</option>
        {updateRequestStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={currentPriority ?? ""}
        onChange={(event) => updateParam("priority", event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">All priorities</option>
        {updateRequestPriorityOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={currentRequestType ?? ""}
        onChange={(event) => updateParam("requestType", event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">All types</option>
        {updateRequestTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={currentClientId ?? ""}
        onChange={(event) => updateParam("clientId", event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">All clients</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.businessName ?? client.name}
          </option>
        ))}
      </select>

      <select
        value={currentProjectId ?? ""}
        onChange={(event) => updateParam("projectId", event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">All projects</option>
        {filteredProjects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}
