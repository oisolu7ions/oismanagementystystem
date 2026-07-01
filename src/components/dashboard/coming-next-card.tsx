import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import {
  ArrowRight,
  Bell,
  Building2,
  CheckSquare,
  Clock,
  FileText,
  FolderKanban,
  Globe,
  Link2,
  ClipboardList,
  Package,
  Sparkles,
  StickyNote,
  Users,
  Zap,
} from "lucide-react";

type ModuleItem = {
  title: string;
  description: string;
  icon: typeof Package;
  href?: string;
  badge: "live" | "next" | "future";
};

const modules: ModuleItem[] = [
  {
    title: "Packages",
    description: "Service tiers, pricing, and features.",
    icon: Package,
    href: "/dashboard/packages",
    badge: "live",
  },
  {
    title: "Leads",
    description: "Prospects through the sales pipeline.",
    icon: Users,
    href: "/dashboard/leads",
    badge: "live",
  },
  {
    title: "Clients",
    description: "Active client relationships and packages.",
    icon: Building2,
    href: "/dashboard/clients",
    badge: "live",
  },
  {
    title: "Projects",
    description: "Client work with clear status and scope.",
    icon: FolderKanban,
    href: "/dashboard/projects",
    badge: "live",
  },
  {
    title: "Tasks",
    description: "Prioritized, trackable project work.",
    icon: CheckSquare,
    href: "/dashboard/tasks",
    badge: "live",
  },
  {
    title: "Invoices",
    description: "Billing, due dates, and payment links.",
    icon: FileText,
    href: "/dashboard/invoices",
    badge: "live",
  },
  {
    title: "Follow-ups",
    description: "Manual reminders for leads and clients.",
    icon: Bell,
    href: "/dashboard/follow-ups",
    badge: "live",
  },
  {
    title: "Notes",
    description: "Internal notes on leads, clients, and projects.",
    icon: StickyNote,
    badge: "live",
  },
  {
    title: "Documents",
    description: "Linked files and references (URL-based).",
    icon: Link2,
    href: "/dashboard/documents",
    badge: "live",
  },
  {
    title: "Activity Timeline",
    description: "Unified history across the client lifecycle.",
    icon: Clock,
    href: "/dashboard/activity",
    badge: "live",
  },
  {
    title: "Client Portal",
    description: "Client-facing portal with update requests and visibility controls.",
    icon: Globe,
    href: "/client/login",
    badge: "live",
  },
  {
    title: "Update Requests",
    description: "Client-submitted change requests for managed systems.",
    icon: ClipboardList,
    href: "/dashboard/update-requests",
    badge: "live",
  },
  {
    title: "Automation",
    description: "Workflow triggers and scheduled actions.",
    icon: Zap,
    badge: "next",
  },
  {
    title: "AI Assistant",
    description: "Context-aware help across Management Center.",
    icon: Sparkles,
    badge: "future",
  },
];

function ModuleBadge({ badge }: { badge: ModuleItem["badge"] }) {
  if (badge === "live") return <Badge variant="success">Live</Badge>;
  if (badge === "next") return <Badge variant="info">Next</Badge>;
  return <Badge variant="muted">Future</Badge>;
}

export function ComingNextCard() {
  return (
    <Card>
      <CardHeader
        title="Modules"
        description="What is live today and what is planned next."
      />
      <CardBody className="space-y-4">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const inner = (
            <>
              <div className="rounded-lg bg-slate-100 p-2">
                <Icon className="h-4 w-4 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">{mod.title}</p>
                  <ModuleBadge badge={mod.badge} />
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{mod.description}</p>
              </div>
              {mod.href ? (
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
              ) : null}
            </>
          );

          return mod.href ? (
            <Link
              key={mod.title}
              href={mod.href}
              className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={mod.title}
              className="flex items-start gap-3 rounded-lg border border-slate-100 p-3"
            >
              {inner}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
