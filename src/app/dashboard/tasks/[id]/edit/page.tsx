import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
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
        <BackLink fallbackHref={`/dashboard/tasks/${task.id}`} />
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
