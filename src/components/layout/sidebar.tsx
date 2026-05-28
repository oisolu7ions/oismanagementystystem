"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavigation } from "@/config/navigation";
import { AppBrand } from "@/components/layout/app-brand";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <AppBrand href="/dashboard" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {mainNavigation.map((item) => {
          const Icon = item.icon;
          const active =
            item.enabled &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`));

          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400"
                title={`Available in Phase ${item.phase}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-sm">{item.label}</span>
                {item.phase ? (
                  <Badge variant="muted">Phase {item.phase}</Badge>
                ) : null}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-5 py-4">
        <p className="text-xs text-slate-400">OIS Technology</p>
        <p className="text-xs text-slate-500">Phase 12 — Dashboard</p>
      </div>
    </aside>
  );
}
