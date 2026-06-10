import type { ReactNode } from "react";

export function ResponsiveTable({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["relative", className].filter(Boolean).join(" ")}>
      <div className="-mx-1 overflow-x-auto rounded-lg border border-slate-200 sm:mx-0">
        <div className="inline-block min-w-full align-middle">{children}</div>
      </div>
      <p className="mt-2 text-center text-xs text-slate-400 md:hidden">
        Swipe horizontally to see more columns
      </p>
    </div>
  );
}
