"use client";

import { logoutAction } from "@/actions/auth";
import { useMobileNav } from "@/components/layout/mobile-nav-context";
import { Button } from "@/components/ui/button";
import type { SessionPayload } from "@/types/session";
import { LogOut, Menu } from "lucide-react";

export function DashboardHeader({ session }: { session: SessionPayload }) {
  const { toggle } = useMobileNav();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation menu"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
          onClick={toggle}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Welcome back
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">{session.name}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden text-right md:block">
          <p className="text-sm text-slate-700">{session.email}</p>
          <p className="text-xs text-slate-500 capitalize">
            {session.role.toLowerCase()} account
          </p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" size="sm" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
