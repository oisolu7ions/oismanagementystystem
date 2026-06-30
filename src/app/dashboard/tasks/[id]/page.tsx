import Link from "next/link";
import { notFound } from "next/navigation";
import { getTaskById } from "@/actions/tasks";
import { TaskDeleteButton } from "@/components/tasks/task-delete-button";
import { TaskDueDate } from "@/components/tasks/task-due-date";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskQuickStatusSelect } from "@/components/tasks/task-quick-status-select";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { EntityClientVisibilityToggle } from "@/components/client-sharing/entity-client-visibility-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type TaskDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const task = await getTaskById(id);
  return { title: task?.title ?? "Task" };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/tasks"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to tasks
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{task.title}</h2>
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/tasks/${task.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <TaskDeleteButton taskId={task.id} taskTitle={task.title} />
        </div>
      </div>

      <Card>
        <CardHeader title="Project & client" />
        <CardBody className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Project
            </p>
            <p className="mt-1">
              <Link
                href={`/dashboard/projects/${task.project.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {task.project.name}
              </Link>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Client
            </p>
            <p className="mt-1">
              <Link
                href={`/dashboard/clients/${task.project.client.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {task.project.client.name}
              </Link>
              {task.project.client.businessName ? (
                <span className="text-slate-600">
                  {" "}
                  — {task.project.client.businessName}
                </span>
              ) : null}
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Status" />
          <CardBody className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Current status
              </p>
              <div className="mt-1">
                <TaskStatusBadge status={task.status} />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                Quick update
              </p>
              <TaskQuickStatusSelect taskId={task.id} currentStatus={task.status} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Schedule" />
          <CardBody className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Due date
              </p>
              <p className="mt-1">
                <TaskDueDate dueDate={task.dueDate} status={task.status} />
              </p>
            </div>
            {task.completedAt ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Completed
                </p>
                <p className="mt-1 text-slate-900">
                  {task.completedAt.toLocaleString()}
                </p>
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>

      {task.description ? (
        <Card>
          <CardHeader title="Description" />
          <CardBody>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {task.description}
            </p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Client portal sharing" />
        <CardBody>
          <EntityClientVisibilityToggle
            entityType="task"
            entityId={task.id}
            clientVisible={task.clientVisible}
            clientNote={task.clientNote}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Record" />
        <CardBody className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-medium text-slate-700">Created:</span>{" "}
            {task.createdAt.toLocaleString()}
          </p>
          <p>
            <span className="font-medium text-slate-700">Updated:</span>{" "}
            {task.updatedAt.toLocaleString()}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
