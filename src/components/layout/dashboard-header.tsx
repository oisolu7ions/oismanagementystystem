import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import type { SessionPayload } from "@/types/session";
import { LogOut } from "lucide-react";

export function DashboardHeader({ session }: { session: SessionPayload }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Welcome back
        </p>
        <p className="text-sm font-semibold text-slate-900">{session.name}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm text-slate-700">{session.email}</p>
          <p className="text-xs text-slate-500 capitalize">
            {session.role.toLowerCase()} account
          </p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" size="sm">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
