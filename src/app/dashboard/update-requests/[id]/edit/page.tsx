import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { updateUpdateRequestAction } from "@/actions/update-request-mutations";
import {
  getClientsForUpdateRequestFilter,
  getProjectsForUpdateRequestFilter,
  getUpdateRequestById,
} from "@/actions/update-requests";
import { UpdateRequestForm } from "@/components/update-requests/update-request-form";
import { updateRequestDateToInputValue } from "@/lib/update-requests/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type EditUpdateRequestPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditUpdateRequestPageProps) {
  const { id } = await params;
  const request = await getUpdateRequestById(id);
  return { title: request ? `Edit ${request.title}` : "Edit Update Request" };
}

export default async function EditUpdateRequestPage({ params }: EditUpdateRequestPageProps) {
  const { id } = await params;
  const request = await getUpdateRequestById(id);

  if (!request) {
    notFound();
  }

  const [clients, projects] = await Promise.all([
    getClientsForUpdateRequestFilter(),
    getProjectsForUpdateRequestFilter(request.clientId),
  ]);

  const boundUpdate = updateUpdateRequestAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref={`/dashboard/update-requests/${request.id}`} />
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          Edit Update Request
        </h2>
      </div>

      <Card>
        <CardHeader title="Request details" />
        <CardBody>
          <UpdateRequestForm
            mode="edit"
            action={boundUpdate}
            clients={clients}
            projects={projects}
            initialValues={{
              clientId: request.clientId,
              projectId: request.projectId ?? undefined,
              title: request.title,
              requestType: request.requestType,
              priority: request.priority,
              status: request.status,
              description: request.description,
              adminNotes: request.adminNotes ?? undefined,
              clientVisibleResponse: request.clientVisibleResponse ?? undefined,
              estimatedPrice: request.estimatedPrice ?? undefined,
              approvedPrice: request.approvedPrice ?? undefined,
              dueDate: updateRequestDateToInputValue(request.dueDate),
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
