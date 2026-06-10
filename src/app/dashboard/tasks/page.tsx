import Link from "next/link";
import { Suspense } from "react";
import {
  getClientsForTaskFilter,
  getProjectsForTaskFilter,
  searchTasks,
  type TaskSearchParams,
} from "@/actions/tasks";
import { TaskDueDate } from "@/components/tasks/task-due-date";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskSearch } from "@/components/tasks/task-search";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";

type TasksPageProps = {
  searchParams: Promise<TaskSearchParams>;
};

export const metadata = {
  title: "Tasks",
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const [tasks, projects, clients] = await Promise.all([
    searchTasks(params),
    getProjectsForTaskFilter(),
    getClientsForTaskFilter(),
  ]);
  const hasFilters = Boolean(
    params.q ||
      params.status ||
      params.priority ||
      params.projectId ||
      params.clientId ||
      params.overdue ||
      params.dueSoon,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Tasks</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track project work, priorities, and due dates across all clients.
          </p>
        </div>
        <Link href="/dashboard/tasks/new">
          <Button>
            <Plus className="h-4 w-4" />
            New task
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader
          title="All tasks"
          description={`${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
        />
        <CardBody className="space-y-4">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-100" />}>
            <TaskSearch defaultValue={params.q ?? ""} />
          </Suspense>
          <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-slate-100" />}>
            <TaskFilters
              currentStatus={params.status}
              currentPriority={params.priority}
              currentProjectId={params.projectId}
              currentClientId={params.clientId}
              projects={projects}
              clients={clients}
            />
          </Suspense>

          {tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No tasks found</p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try adjusting your search or filters."
                  : "Create your first task on a project."}
              </p>
              {!hasFilters ? (
                <Link href="/dashboard/tasks/new" className="mt-4 inline-block">
                  <Button size="sm">Create task</Button>
                </Link>
              ) : null}
            </div>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Task
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Due
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/dashboard/tasks/${task.id}`}
                          className="hover:underline"
                        >
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <Link
                          href={`/dashboard/projects/${task.project.id}`}
                          className="hover:underline"
                        >
                          {task.project.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <Link
                          href={`/dashboard/clients/${task.project.client.id}`}
                          className="font-medium text-slate-800 hover:underline"
                        >
                          {task.project.client.name}
                        </Link>
                        {task.project.client.businessName ? (
                          <div className="text-xs text-slate-500">
                            {task.project.client.businessName}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <TaskStatusBadge status={task.status} />
                      </td>
                      <td className="px-4 py-3">
                        <TaskPriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <TaskDueDate dueDate={task.dueDate} status={task.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/tasks/${task.id}/edit`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
