import { getDashboardMetrics } from "@/actions/dashboard";
import { ClientLifecycleCard } from "@/components/dashboard/client-lifecycle-card";
import { ComingNextCard } from "@/components/dashboard/coming-next-card";
import { DashboardStatCards } from "@/components/dashboard/dashboard-stat-cards";
import { FollowUpAlertsCard } from "@/components/dashboard/follow-up-alerts-card";
import { InvoiceSnapshotCard } from "@/components/dashboard/invoice-snapshot-card";
import { LeadPipelineCard } from "@/components/dashboard/lead-pipeline-card";
import { ProjectSnapshotCard } from "@/components/dashboard/project-snapshot-card";
import { TaskAlertsCard } from "@/components/dashboard/task-alerts-card";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          Real-time metrics across leads, clients, projects, tasks, billing, and
          follow-ups.
        </p>
      </div>

      <DashboardStatCards cards={metrics.cards} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TaskAlertsCard taskAlerts={metrics.taskAlerts} />
        <FollowUpAlertsCard followUpAlerts={metrics.followUpAlerts} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InvoiceSnapshotCard snapshot={metrics.invoiceSnapshot} />
        <ProjectSnapshotCard snapshot={metrics.projectSnapshot} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LeadPipelineCard pipeline={metrics.leadPipeline} />
        <ClientLifecycleCard lifecycle={metrics.lifecycle} />
      </div>

      <ComingNextCard />
    </div>
  );
}
