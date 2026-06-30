import Link from "next/link";
import {
  createUpdateRequestAction,
} from "@/actions/update-request-mutations";
import {
  getClientsForUpdateRequestFilter,
  getProjectsForUpdateRequestFilter,
} from "@/actions/update-requests";
import { UpdateRequestForm } from "@/components/update-requests/update-request-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type NewUpdateRequestPageProps = {
  searchParams: Promise<{ clientId?: string; projectId?: string }>;
};

export const metadata = {
  title: "New Update Request",
};

export default async function NewUpdateRequestPage({ searchParams }: NewUpdateRequestPageProps) {
  const { clientId, projectId } = await searchParams;
  const [clients, projects] = await Promise.all([
    getClientsForUpdateRequestFilter(),
    getProjectsForUpdateRequestFilter(clientId),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/update-requests"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to update requests
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          New Update Request
        </h2>
      </div>

      <Card>
        <CardHeader title="Request details" />
        <CardBody>
          <UpdateRequestForm
            mode="create"
            action={createUpdateRequestAction}
            clients={clients}
            projects={projects}
            initialValues={{
              clientId,
              projectId,
            }}
            lockClientId={Boolean(clientId)}
            lockProjectId={Boolean(projectId)}
          />
        </CardBody>
      </Card>
    </div>
  );
}
