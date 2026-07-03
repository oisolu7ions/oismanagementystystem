import { BackLink } from "@/components/layout/back-link";
import { createProjectAction } from "@/actions/project-mutations";
import {
  getClientsForProjectForm,
  getPackagesForProjectForm,
} from "@/actions/projects";
import { ProjectForm } from "@/components/projects/project-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getPortalDefaultSettings } from "@/lib/settings";

type NewProjectPageProps = {
  searchParams: Promise<{ clientId?: string }>;
};

export const metadata = {
  title: "New project",
};

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const { clientId } = await searchParams;
  const [clients, packages, portalDefaults] = await Promise.all([
    getClientsForProjectForm(),
    getPackagesForProjectForm(),
    getPortalDefaultSettings(),
  ]);

  const backHref = clientId ? `/dashboard/clients/${clientId}` : "/dashboard/projects";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref={backHref} />
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">New project</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create a deliverable for a client — website, integration, dashboard, or other
          work.
        </p>
      </div>

      <Card>
        <CardHeader title="Project details" />
        <CardBody>
          <ProjectForm
            mode="create"
            action={createProjectAction}
            clients={clients}
            packages={packages}
            initialValues={{
              clientId: clientId ?? undefined,
              status: "NOT_STARTED",
              serviceType: "WEBSITE_BUILD",
              clientVisible: portalDefaults.defaultProjectVisible,
            }}
            lockClientId={Boolean(clientId)}
          />
        </CardBody>
      </Card>
    </div>
  );
}
