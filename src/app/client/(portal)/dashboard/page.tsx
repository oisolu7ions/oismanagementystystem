import Link from "next/link";
import {
  getClientPortalDashboard,
  getClientProfile,
} from "@/lib/client-portal/queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { getProjectStatusLabel } from "@/lib/projects/constants";
import { getInvoiceStatusLabel } from "@/lib/invoices/constants";
import { formatTaskDate, getTaskStatusLabel } from "@/lib/tasks/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

export const metadata = {
  title: "Overview",
};

export default async function ClientDashboardPage() {
  const session = await requireClientPortalSession();
  const [profile, dashboard] = await Promise.all([
    getClientProfile(session.clientId),
    getClientPortalDashboard(session.clientId),
  ]);

  if (!profile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Welcome, {session.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {profile.businessName ?? profile.name} · Your project overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active projects", value: dashboard.stats.activeProjects },
          { label: "Open tasks", value: dashboard.stats.openTasks },
          { label: "Unpaid invoices", value: dashboard.stats.unpaidInvoices },
          { label: "Documents", value: dashboard.stats.documents },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Active projects"
            description="Your current work with OIS"
          />
          <CardBody className="space-y-3">
            {dashboard.projects.length === 0 ? (
              <p className="text-sm text-slate-500">No active projects yet.</p>
            ) : (
              dashboard.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/client/projects/${project.id}`}
                  className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{project.name}</p>
                      {project.clientSummary ? (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {project.clientSummary}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-500">
                          {getProjectStatusLabel(project.status)}
                        </p>
                      )}
                    </div>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                </Link>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Project Updates"
            description="Latest updates from OIS"
          />
          <CardBody className="space-y-3">
            {dashboard.updates.length === 0 ? (
              <p className="text-sm text-slate-500">Updates will appear here.</p>
            ) : (
              <>
                {dashboard.updates.map((update) => (
                  <div
                    key={update.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <p className="text-slate-800">{update.displayMessage}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {update.project?.name ? `${update.project.name} · ` : ""}
                      {update.createdAt.toLocaleString()}
                    </p>
                  </div>
                ))}
                <Link
                  href="/client/updates"
                  className="inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  View all updates →
                </Link>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Tasks" />
          <CardBody className="space-y-3">
            {dashboard.openTasks.length === 0 ? (
              <p className="text-sm text-slate-500">No open tasks right now.</p>
            ) : (
              dashboard.openTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="mt-1 text-slate-600">
                    {task.project.name} · {getTaskStatusLabel(task.status)}
                    {task.dueDate ? ` · Due ${formatTaskDate(task.dueDate)}` : ""}
                  </p>
                  {task.clientNote ? (
                    <p className="mt-2 text-slate-600">{task.clientNote}</p>
                  ) : null}
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Invoices" />
          <CardBody className="space-y-3">
            {dashboard.invoices.length === 0 ? (
              <p className="text-sm text-slate-500">No invoices to show.</p>
            ) : (
              dashboard.invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/client/invoices/${invoice.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-slate-600">
                      {invoice.amount} · {getInvoiceStatusLabel(invoice.status)}
                    </p>
                    {invoice.clientNote ? (
                      <p className="mt-1 text-sm text-slate-500">{invoice.clientNote}</p>
                    ) : null}
                  </div>
                  <InvoiceStatusBadge status={invoice.status} />
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
