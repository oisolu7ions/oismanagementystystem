import Link from "next/link";
import { createTaskAction } from "@/actions/task-mutations";
import { getProjectsForTaskForm } from "@/actions/tasks";
import { TaskForm } from "@/components/tasks/task-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getPortalDefaultSettings } from "@/lib/settings";

type NewTaskPageProps = {
  searchParams: Promise<{ projectId?: string }>;
};

export const metadata = {
  title: "New task",
};

export default async function NewTaskPage({ searchParams }: NewTaskPageProps) {
  const { projectId } = await searchParams;
  const [projects, portalDefaults] = await Promise.all([
    getProjectsForTaskForm(),
    getPortalDefaultSettings(),
  ]);

  const backHref = projectId
    ? `/dashboard/projects/${projectId}`
    : "/dashboard/tasks";
  const backLabel = projectId ? "← Back to project" : "← Back to tasks";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={backHref}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          {backLabel}
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">New task</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add a task to a project and set priority and due date.
        </p>
      </div>

      <Card>
        <CardHeader title="Task details" />
        <CardBody>
          <TaskForm
            mode="create"
            action={createTaskAction}
            projects={projects}
            initialValues={{
              projectId: projectId ?? undefined,
              status: "TODO",
              priority: "MEDIUM",
              clientVisible: portalDefaults.defaultTaskVisible,
            }}
            lockProjectId={Boolean(projectId)}
          />
        </CardBody>
      </Card>
    </div>
  );
}
