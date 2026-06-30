import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTaskAction } from "@/actions/task-mutations";
import { getProjectsForTaskForm, getTaskById } from "@/actions/tasks";
import { TaskForm } from "@/components/tasks/task-form";
import { taskDateToInputValue } from "@/lib/tasks/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type EditTaskPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditTaskPageProps) {
  const { id } = await params;
  const task = await getTaskById(id);
  return { title: task ? `Edit ${task.title}` : "Edit task" };
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  const projects = await getProjectsForTaskForm();
  const boundUpdate = updateTaskAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/dashboard/tasks/${task.id}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to task
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          Edit {task.title}
        </h2>
      </div>

      <Card>
        <CardHeader title="Task details" />
        <CardBody>
          <TaskForm
            mode="edit"
            action={boundUpdate}
            projects={projects}
            initialValues={{
              title: task.title,
              projectId: task.projectId,
              description: task.description ?? undefined,
              status: task.status,
              priority: task.priority,
              dueDate: taskDateToInputValue(task.dueDate),
              clientVisible: task.clientVisible,
              clientNote: task.clientNote ?? undefined,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
