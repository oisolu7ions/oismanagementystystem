"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { clientStatusOptions } from "@/lib/clients/constants";

type PackageOption = { id: string; name: string };

export function ClientFilters({
  currentStatus,
  currentPackageId,
  packages,
}: {
  currentStatus?: string;
  currentPackageId?: string;
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
    router.replace(next ? `/dashboard/clients?${next}` : "/dashboard/clients");
  }

  const selectClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
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
          {clientStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
