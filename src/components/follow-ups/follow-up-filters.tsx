"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  followUpReasonOptions,
  followUpStatusOptions,
} from "@/lib/follow-ups/constants";

type LeadOption = { id: string; name: string; businessName: string | null };
type ClientOption = { id: string; name: string; businessName: string | null };

export function FollowUpFilters({
  currentStatus,
  currentReason,
  currentLeadId,
  currentClientId,
  currentDueToday,
  currentOverdue,
  currentUpcoming,
  leads,
  clients,
}: {
  currentStatus?: string;
  currentReason?: string;
  currentLeadId?: string;
  currentClientId?: string;
  currentDueToday?: string;
  currentOverdue?: string;
  currentUpcoming?: string;
  leads: LeadOption[];
  clients: ClientOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "dueToday" || key === "overdue" || key === "upcoming") {
      params.delete("dueToday");
      params.delete("overdue");
      params.delete("upcoming");
      if (value === "1") {
        params.set(key, "1");
      }
    } else if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const next = params.toString();
    router.replace(
      next ? `/dashboard/follow-ups?${next}` : "/dashboard/follow-ups",
    );
  }

  const selectClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  const scheduleFilter = currentDueToday
    ? "dueToday"
    : currentOverdue
      ? "overdue"
      : currentUpcoming
        ? "upcoming"
        : "";

  return (
    <div className="space-y-4">
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
            {followUpStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="reason" className="block text-sm font-medium text-slate-700">
            Reason
          </label>
          <select
            id="reason"
            value={currentReason ?? ""}
            onChange={(e) => updateParam("reason", e.target.value)}
            className={selectClass}
          >
            <option value="">All reasons</option>
            {followUpReasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="leadId" className="block text-sm font-medium text-slate-700">
            Lead
          </label>
          <select
            id="leadId"
            value={currentLeadId ?? ""}
            onChange={(e) => updateParam("leadId", e.target.value)}
            className={selectClass}
          >
            <option value="">All leads</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name}
                {lead.businessName ? ` — ${lead.businessName}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="clientId"
            className="block text-sm font-medium text-slate-700"
          >
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

      <div className="space-y-1.5">
        <label htmlFor="schedule" className="block text-sm font-medium text-slate-700">
          Schedule
        </label>
        <select
          id="schedule"
          value={scheduleFilter}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("dueToday");
              params.delete("overdue");
              params.delete("upcoming");
              const next = params.toString();
              router.replace(
                next ? `/dashboard/follow-ups?${next}` : "/dashboard/follow-ups",
              );
              return;
            }
            updateParam(value, "1");
          }}
          className={selectClass}
        >
          <option value="">All dates</option>
          <option value="dueToday">Due today</option>
          <option value="overdue">Overdue</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>
    </div>
  );
}
