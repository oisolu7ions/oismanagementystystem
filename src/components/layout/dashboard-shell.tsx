"use client";

import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
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
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader session={session} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
