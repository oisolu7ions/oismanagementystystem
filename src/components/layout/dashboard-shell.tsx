"use client";

import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SessionIdleMonitor } from "@/components/auth/session-idle-monitor";
import {
  ADMIN_SESSION_IDLE_TIMEOUT_SECONDS,
  ADMIN_SESSION_LAST_SEEN_UPDATE_SECONDS,
} from "@/lib/auth/constants";
import { MobileNavProvider } from "@/components/layout/mobile-nav-context";
import { Sidebar } from "@/components/layout/sidebar";
import type { SessionPayload } from "@/types/session";

export function DashboardShell({
  session,
  children,
}: {
  session: SessionPayload;
  children: ReactNode;
}) {
  return (
    <MobileNavProvider>
      <SessionIdleMonitor
        idleTimeoutSeconds={ADMIN_SESSION_IDLE_TIMEOUT_SECONDS}
        keepaliveIntervalSeconds={ADMIN_SESSION_LAST_SEEN_UPDATE_SECONDS}
        keepaliveUrl="/api/session/keepalive"
        expiredUrl="/session-expired"
      />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:ml-64">
          <DashboardHeader session={session} />
          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
