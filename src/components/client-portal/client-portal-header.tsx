"use client";

import { clientLogoutAction } from "@/actions/client-portal-auth";
import { Button } from "@/components/ui/button";
import type { ClientSessionPayload } from "@/types/client-session";

export function ClientPortalHeader({
  session,
  onMenuClick,
}: {
  session: ClientSessionPayload;
  onMenuClick?: () => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:h-16 sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick ? (
          <button
            type="button"
            aria-label="Open navigation menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={onMenuClick}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{session.name}</p>
          <p className="truncate text-xs text-slate-500">{session.email}</p>
        </div>
      </div>
      <form action={clientLogoutAction}>
        <Button type="submit" variant="secondary" size="sm">
          Sign out
        </Button>
      </form>
    </header>
  );
}
