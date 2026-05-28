"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  projectStatusOptions,
  serviceTypeOptions,
} from "@/lib/projects/constants";

type ClientOption = { id: string; name: string; businessName: string | null };
type PackageOption = { id: string; name: string };

export function ProjectFilters({
  currentStatus,
  currentServiceType,
  currentClientId,
  currentPackageId,
  clients,
  packages,
}: {
  currentStatus?: string;
  currentServiceType?: string;
  currentClientId?: string;
  currentPackageId?: string;
  clients: ClientOption[];
  packages: PackageOption[];
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
    router.replace(next ? `/dashboard/projects?${next}` : "/dashboard/projects");
  }

  const selectClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

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
          {projectStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
          value={currentServiceType ?? ""}
          onChange={(e) => updateParam("serviceType", e.target.value)}
          className={selectClass}
        >
          <option value="">All service types</option>
          {serviceTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
      <div className="space-y-1.5">
        <label htmlFor="packageId" className="block text-sm font-medium text-slate-700">
          Package
        </label>
        <select
          id="packageId"
          value={currentPackageId ?? ""}
          onChange={(e) => updateParam("packageId", e.target.value)}
          className={selectClass}
        >
          <option value="">All packages</option>
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
