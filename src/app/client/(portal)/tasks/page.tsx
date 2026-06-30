import Link from "next/link";
import { getClientPortalTasks } from "@/lib/client-portal/queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { formatTaskDate, getTaskStatusLabel } from "@/lib/tasks/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";

export const metadata = {
  title: "Tasks",
};

export default async function ClientTasksPage() {
  const session = await requireClientPortalSession();
  const tasks = await getClientPortalTasks(session.clientId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">Work items across your projects.</p>
      </div>

      <Card>
        <CardHeader
          title="All tasks"
          description={`${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
        />
        <CardBody>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks to display.</p>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Task</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Project</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Due</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{task.title}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <Link
                          href={`/client/projects/${task.project.id}`}
                          className="hover:underline"
                        >
                          {task.project.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {getTaskStatusLabel(task.status)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatTaskDate(task.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {task.clientNote ?? "—"}
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
