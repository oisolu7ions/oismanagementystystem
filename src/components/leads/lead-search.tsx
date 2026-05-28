"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export function LeadSearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultValue);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = query.trim();
      const current = searchParams.get("q") ?? "";
      if (trimmed === current) return;

      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      const next = params.toString();
      router.replace(next ? `/dashboard/leads?${next}` : "/dashboard/leads");
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, router, searchParams]);

  return (
    <Input
      label="Search leads"
      name="q"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Name, business, email, phone, or service interest..."
    />
  );
}
