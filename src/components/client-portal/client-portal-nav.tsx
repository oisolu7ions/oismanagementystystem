import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  CheckSquare,
  ClipboardList,
  Megaphone,
  Paperclip,
  User,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/client/projects", icon: FolderKanban },
  { label: "Tasks", href: "/client/tasks", icon: CheckSquare },
  { label: "Invoices", href: "/client/invoices", icon: FileText },
  { label: "Documents", href: "/client/documents", icon: Paperclip },
  { label: "Update Requests", href: "/client/update-requests", icon: ClipboardList },
  { label: "Updates", href: "/client/updates", icon: Megaphone },
  { label: "Account", href: "/client/account", icon: User },
];

export function ClientPortalNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={[
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
  );
}
