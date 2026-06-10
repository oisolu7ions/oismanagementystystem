import Link from "next/link";
import type { ServiceType, TaskPriority, TaskStatus } from "@/generated/prisma/client";
import { getTaskProgressSummary } from "@/lib/tasks/constants";
import { checklistTitlesAlreadyPresent } from "@/lib/tasks/website-build-checklist";
import { ProjectTasksSectionClient } from "@/components/tasks/project-tasks-section-client";
import { TaskDueDate } from "@/components/tasks/task-due-date";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskQuickStatusSelect } from "@/components/tasks/task-quick-status-select";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { WebsiteBuildChecklistButton } from "@/components/tasks/website-build-checklist-button";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";

type ProjectTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
};

export function ProjectTasksSection({
  projectId,
  serviceType,
  tasks,
}: {
  projectId: string;
  serviceType: ServiceType;
  tasks: ProjectTask[];
}) {
  const progress = getTaskProgressSummary(tasks);
  const showChecklist =
    serviceType === "WEBSITE_BUILD" || serviceType === "WEBSITE_REDESIGN";
  const checklistComplete = checklistTitlesAlreadyPresent(
    tasks.map((t) => t.title),
  );

  const headerAction = (
    <div className="flex flex-wrap items-center gap-2">
      {showChecklist ? (
        <WebsiteBuildChecklistButton
          projectId={projectId}
          disabled={checklistComplete}
        />
      ) : null}
      <Link href={`/dashboard/tasks/new?projectId=${projectId}`}>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </Link>
    </div>
  );

  return (
    <Card>
      <CardHeader
        title="Tasks"
        description={`${progress.completed} of ${progress.total} complete (${progress.percentComplete}%)`}
        action={headerAction}
      />
      <CardBody className="space-y-4">
        <ProjectTasksSectionClient progress={progress} />

        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No tasks yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Break this project into actionable steps or add the website build
              checklist.
            </p>
            <Link
              href={`/dashboard/tasks/new?projectId=${projectId}`}
              className="mt-4 inline-block"
            >
              <Button size="sm">Create first task</Button>
            </Link>
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
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Quick update
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Due
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
                    <td className="px-4 py-3">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <TaskQuickStatusSelect
                        taskId={task.id}
                        currentStatus={task.status}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <TaskPriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <TaskDueDate dueDate={task.dueDate} status={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        )}
      </CardBody>
    </Card>
  );
}
