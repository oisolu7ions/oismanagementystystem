"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ClientBrand } from "@/components/client-portal/client-brand";
import { ClientPortalHeader } from "@/components/client-portal/client-portal-header";
import { ClientPortalNav } from "@/components/client-portal/client-portal-nav";
import { LegalSupportFooter, type LegalSupportFooterLink } from "@/components/legal-support/legal-support-footer";
import type { ClientSessionPayload } from "@/types/client-session";

export function ClientPortalShell({
  session,
  children,
  footerLinks,
  showFooter = true,
}: {
  session: ClientSessionPayload;
  children: ReactNode;
  footerLinks?: LegalSupportFooterLink[];
  showFooter?: boolean;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <button
        type="button"
        aria-label="Close navigation menu"
        className={[
          "fixed inset-0 z-40 bg-slate-900/50 transition-opacity lg:hidden",
          navOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setNavOpen(false)}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:static lg:z-auto lg:max-w-none lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="border-b border-slate-100 px-4 py-4">
          <ClientBrand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <ClientPortalNav onNavigate={() => setNavOpen(false)} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <ClientPortalHeader session={session} onMenuClick={() => setNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        {showFooter ? (
          <LegalSupportFooter
            className="border-t border-slate-200 bg-white/80 px-4 py-4 sm:px-6"
            links={footerLinks}
          />
        ) : null}
      </div>
    </div>
  );
}
