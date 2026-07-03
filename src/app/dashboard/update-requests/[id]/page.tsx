import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { getUpdateRequestById } from "@/actions/update-requests";
import { UpdateRequestAttachmentsList } from "@/components/update-requests/update-request-attachments-list";
import {
  UpdateRequestPriorityBadge,
  UpdateRequestStatusBadge,
  UpdateRequestTypeBadge,
} from "@/components/update-requests/update-request-badges";
import { CreateTaskFromUpdateRequestButton } from "@/components/update-requests/create-task-from-request-button";
import { formatUpdateRequestDate } from "@/lib/update-requests/constants";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type UpdateRequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: UpdateRequestDetailPageProps) {
  const { id } = await params;
  const request = await getUpdateRequestById(id);
  return { title: request?.title ?? "Update Request" };
}

export default async function UpdateRequestDetailPage({ params }: UpdateRequestDetailPageProps) {
  const { id } = await params;
  const request = await getUpdateRequestById(id);

  if (!request) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <BackLink fallbackHref="/dashboard/update-requests" />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{request.title}</h2>
            <UpdateRequestStatusBadge status={request.status} />
            <UpdateRequestPriorityBadge priority={request.priority} />
            <UpdateRequestTypeBadge type={request.requestType} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/update-requests/${request.id}/edit`}>
            <Button size="sm">Edit</Button>
          </Link>
          <CreateTaskFromUpdateRequestButton
            updateRequestId={request.id}
            disabled={!request.projectId || Boolean(request.linkedTask)}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Client" />
          <CardBody className="space-y-2 text-sm">
            <p>
              <Link
                href={`/dashboard/clients/${request.client.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {request.client.name}
              </Link>
            </p>
            {request.client.businessName ? (
              <p className="text-slate-600">{request.client.businessName}</p>
            ) : null}
            {request.requestedByClientUser ? (
              <p className="text-slate-600">
                Submitted by {request.requestedByClientUser.name} (
                {request.requestedByClientUser.email})
              </p>
            ) : (
              <p className="text-slate-500">Created by admin</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Project" />
          <CardBody className="text-sm">
            {request.project ? (
              <Link
                href={`/dashboard/projects/${request.project.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {request.project.name}
              </Link>
            ) : (
              <p className="text-slate-500">No project linked</p>
            )}
            {request.linkedTask ? (
              <p className="mt-2">
                Linked task:{" "}
                <Link
                  href={`/dashboard/tasks/${request.linkedTask.id}`}
                  className="font-medium hover:underline"
                >
                  {request.linkedTask.title}
                </Link>
              </p>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Request information" />
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-slate-700">{request.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Submitted
              </p>
              <p className="mt-1 text-slate-900">{request.createdAt.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Last updated
              </p>
              <p className="mt-1 text-slate-900">{request.updatedAt.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Due date
              </p>
              <p className="mt-1 text-slate-900">{formatUpdateRequestDate(request.dueDate)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Completed
              </p>
              <p className="mt-1 text-slate-900">{formatUpdateRequestDate(request.completedAt)}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Attachments" />
        <CardBody>
          <UpdateRequestAttachmentsList
            updateRequestId={request.id}
            attachments={request.attachments}
            mode="admin"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Internal admin notes" />
        <CardBody>
          {request.adminNotes ? (
            <p className="whitespace-pre-wrap text-sm text-slate-700">{request.adminNotes}</p>
          ) : (
            <p className="text-sm text-slate-500">No internal notes yet.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="OIS response" />
        <CardBody>
          {request.clientVisibleResponse ? (
            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {request.clientVisibleResponse}
            </p>
          ) : (
            <p className="text-sm text-slate-500">No client-visible response yet.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Pricing" />
        <CardBody className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Estimated price
            </p>
            <p className="mt-1 text-slate-900">{request.estimatedPrice ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Approved price
            </p>
            <p className="mt-1 text-slate-900">{request.approvedPrice ?? "—"}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
