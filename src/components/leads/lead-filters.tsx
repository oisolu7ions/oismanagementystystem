"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { leadSourceOptions, leadStatusOptions } from "@/lib/leads/constants";

export function LeadFilters({
  currentStatus,
  currentSource,
}: {
  currentStatus?: string;
  currentSource?: string;
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
    router.replace(next ? `/dashboard/leads?${next}` : "/dashboard/leads");
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
          {leadStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="source" className="block text-sm font-medium text-slate-700">
          Lead source
        </label>
        <select
          id="source"
          value={currentSource ?? ""}
          onChange={(e) => updateParam("source", e.target.value)}
          className={selectClass}
        >
          <option value="">All sources</option>
          {leadSourceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
