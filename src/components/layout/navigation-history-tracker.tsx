"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  pushInAppHistory,
  syncInAppHistoryOnPop,
} from "@/lib/navigation/history";

export function NavigationHistoryTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    function onPopState() {
      syncInAppHistoryOnPop();
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    pushInAppHistory(href);
  }, [pathname, searchParams]);

  return null;
}
