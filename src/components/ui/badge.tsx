import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "info" | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  info: "bg-blue-50 text-blue-700",
  muted: "bg-slate-50 text-slate-500",
};

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
