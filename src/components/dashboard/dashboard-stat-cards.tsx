import Link from "next/link";
import type { DashboardMetrics } from "@/lib/dashboard/metrics";
import { Card, CardBody } from "@/components/ui/card";
import {
  Building2,
  CheckSquare,
  FileText,
  FolderKanban,
  Link2,
  Bell,
  Users,
} from "lucide-react";

type StatCard = {
  label: string;
  value: number;
  href: string;
  icon: typeof Users;
};

export function DashboardStatCards({
  cards,
}: {
  cards: DashboardMetrics["cards"];
}) {
  const items: StatCard[] = [
    {
      label: "Active leads",
      value: cards.activeLeads,
      href: "/dashboard/leads",
      icon: Users,
    },
    {
      label: "Active clients",
      value: cards.activeClients,
      href: "/dashboard/clients",
      icon: Building2,
    },
    {
      label: "Open projects",
      value: cards.openProjects,
      href: "/dashboard/projects",
      icon: FolderKanban,
    },
    {
      label: "Overdue tasks",
      value: cards.overdueTasks,
      href: "/dashboard/tasks?overdue=1",
      icon: CheckSquare,
    },
    {
      label: "Pending follow-ups",
      value: cards.pendingFollowUps,
      href: "/dashboard/follow-ups",
      icon: Bell,
    },
    {
      label: "Unpaid invoices",
      value: cards.unpaidInvoices,
      href: "/dashboard/invoices",
      icon: FileText,
    },
    {
      label: "Overdue invoices",
      value: cards.overdueInvoices,
      href: "/dashboard/invoices",
      icon: FileText,
    },
    {
      label: "Documents attached",
      value: cards.documentsAttached,
      href: "/dashboard/documents",
      icon: Link2,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link key={stat.label} href={stat.href} className="group block">
            <Card className="transition-colors group-hover:border-slate-300">
              <CardBody>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <Icon className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                  {stat.value}
                </p>
              </CardBody>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
