import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { updateProjectAction } from "@/actions/project-mutations";
import {
  getPackagesForProjectForm,
  getProjectById,
  getClientsForProjectForm,
} from "@/actions/projects";
import { ProjectForm } from "@/components/projects/project-form";
import { projectDateToInputValue } from "@/lib/projects/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditProjectPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  return { title: project ? `Edit ${project.name}` : "Edit project" };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const [clients, packages] = await Promise.all([
    getClientsForProjectForm(),
    getPackagesForProjectForm(project.packageId),
  ]);

  const boundUpdate = updateProjectAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref={`/dashboard/projects/${project.id}`} />
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          Edit {project.name}
        </h2>
      </div>

      <Card>
        <CardHeader title="Project details" />
        <CardBody>
          <ProjectForm
            mode="edit"
            action={boundUpdate}
            clients={clients}
            packages={packages}
            initialValues={{
              name: project.name,
              clientId: project.clientId,
              packageId: project.packageId ?? undefined,
              serviceType: project.serviceType,
              description: project.description ?? undefined,
              status: project.status,
              startDate: projectDateToInputValue(project.startDate),
              dueDate: projectDateToInputValue(project.dueDate),
              price: project.price ?? undefined,
              monthlyFee: project.monthlyFee ?? undefined,
              clientVisible: project.clientVisible,
              clientSummary: project.clientSummary ?? undefined,
              clientStatusNote: project.clientStatusNote ?? undefined,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
