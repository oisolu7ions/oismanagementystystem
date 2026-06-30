"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

export function UpdateRequestSearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") ?? "").trim();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    router.push(`/dashboard/update-requests?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search requests, clients, projects..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Search
      </button>
    </form>
  );
}
