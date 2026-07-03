"use client";

import { useRouter } from "next/navigation";
import { canNavigateBackInApp } from "@/lib/navigation/history";

export const backLinkClassName =
  "text-sm font-medium text-slate-500 hover:text-slate-900";

export function BackLink({
  fallbackHref,
  children = "← Back",
  className = backLinkClassName,
}: {
  fallbackHref: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    if (canNavigateBackInApp()) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <a href={fallbackHref} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
