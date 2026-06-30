import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  CheckSquare,
  FileText,
  Bell,
  Paperclip,
  Package,
  Clock,
  ClipboardList,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  phase?: string;
};

export const mainNavigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  {
    label: "Packages",
    href: "/dashboard/packages",
    icon: Package,
    enabled: true,
    phase: "2",
  },
  { label: "Leads", href: "/dashboard/leads", icon: Users, enabled: true, phase: "3" },
  {
    label: "Clients",
    href: "/dashboard/clients",
    icon: Building2,
    enabled: true,
    phase: "4",
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
    enabled: true,
    phase: "6",
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    enabled: true,
    phase: "7",
  },
  {
    label: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
    enabled: true,
    phase: "8",
  },
  {
    label: "Follow-ups",
    href: "/dashboard/follow-ups",
    icon: Bell,
    enabled: true,
    phase: "9",
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: Paperclip,
    enabled: true,
    phase: "11",
  },
  {
    label: "Activity",
    href: "/dashboard/activity",
    icon: Clock,
    enabled: true,
    phase: "13",
  },
  {
    label: "Update Requests",
    href: "/dashboard/update-requests",
    icon: ClipboardList,
    enabled: true,
    phase: "16",
  },
];
