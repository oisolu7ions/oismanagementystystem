import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import {
  updateClientUpdateRequestAction,
} from "@/actions/client-update-request-mutations";
import {
  getClientPortalUpdateRequestById,
  getClientPortalProjectsForUpdateRequest,
} from "@/lib/client-portal/update-request-queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { UpdateRequestAttachmentsList } from "@/components/update-requests/update-request-attachments-list";
import { CancelClientUpdateRequestButton } from "@/components/update-requests/cancel-client-update-request-button";
import { ClientUpdateRequestForm } from "@/components/update-requests/client-update-request-form";
import {
  UpdateRequestPriorityBadge,
  UpdateRequestStatusBadge,
  UpdateRequestTypeBadge,
} from "@/components/update-requests/update-request-badges";
import {
  CLIENT_CANCELLABLE_UPDATE_REQUEST_STATUSES,
  CLIENT_EDITABLE_UPDATE_REQUEST_STATUSES,
  formatUpdateRequestDate,
} from "@/lib/update-requests/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type ClientUpdateRequestDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ submitted?: string }>;
};

export async function generateMetadata({ params }: ClientUpdateRequestDetailPageProps) {
  const { id } = await params;
  const session = await requireClientPortalSession();
  const request = await getClientPortalUpdateRequestById(session.clientId, id);
  return { title: request?.title ?? "Update Request" };
}

export default async function ClientUpdateRequestDetailPage({
  params,
  searchParams,
}: ClientUpdateRequestDetailPageProps) {
  const { id } = await params;
  const submittedParams = searchParams ? await searchParams : {};
  const showSubmittedConfirmation = submittedParams.submitted === "1";
  const session = await requireClientPortalSession();
  const [request, projects] = await Promise.all([
    getClientPortalUpdateRequestById(session.clientId, id),
    getClientPortalProjectsForUpdateRequest(session.clientId),
  ]);

  if (!request) {
    notFound();
  }

  const canEdit = CLIENT_EDITABLE_UPDATE_REQUEST_STATUSES.includes(
    request.status as (typeof CLIENT_EDITABLE_UPDATE_REQUEST_STATUSES)[number],
  );
  const canCancel = CLIENT_CANCELLABLE_UPDATE_REQUEST_STATUSES.includes(
    request.status as (typeof CLIENT_CANCELLABLE_UPDATE_REQUEST_STATUSES)[number],
  );
  const boundUpdate = updateClientUpdateRequestAction.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <BackLink fallbackHref="/client/update-requests" />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{request.title}</h1>
          <UpdateRequestStatusBadge status={request.status} />
          <UpdateRequestPriorityBadge priority={request.priority} />
          <UpdateRequestTypeBadge type={request.requestType} />
        </div>
      </div>

      {showSubmittedConfirmation ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-medium">Update request submitted.</p>
          <p className="mt-1 text-emerald-700">
            OIS received your request and will review it soon.
          </p>
        </div>
      ) : null}

      {!canEdit ? (
        <>
          <Card>
            <CardHeader title="Request status" />
            <CardBody className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-slate-700">{request.description}</p>
              </div>
              {request.project ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Project
                  </p>
                  <p className="mt-1 text-slate-900">{request.project.name}</p>
                </div>
              ) : null}
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
                  <p className="mt-1 text-slate-900">
                    {formatUpdateRequestDate(request.completedAt)}
                  </p>
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
                mode="client"
              />
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
                <p className="text-sm text-slate-500">
                  OIS has not posted a response yet. We will update you here.
                </p>
              )}
            </CardBody>
          </Card>

          {(request.estimatedPrice || request.approvedPrice) ? (
            <Card>
              <CardHeader title="Pricing" />
              <CardBody className="grid gap-4 text-sm sm:grid-cols-2">
                {request.estimatedPrice ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Estimated price
                    </p>
                    <p className="mt-1 text-slate-900">{request.estimatedPrice}</p>
                  </div>
                ) : null}
                {request.approvedPrice ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Approved price
                    </p>
                    <p className="mt-1 text-slate-900">{request.approvedPrice}</p>
                  </div>
                ) : null}
              </CardBody>
            </Card>
          ) : null}

          {canCancel ? (
            <CancelClientUpdateRequestButton updateRequestId={request.id} />
          ) : null}
        </>
      ) : (
        <Card>
          <CardHeader title="Edit request" />
          <CardBody>
            <ClientUpdateRequestForm
              mode="edit"
              action={boundUpdate}
              projects={projects}
              initialValues={{
                title: request.title,
                requestType: request.requestType,
                priority: request.priority,
                description: request.description,
                projectId: request.projectId ?? undefined,
              }}
            />
            {canCancel ? (
              <div className="mt-4">
                <CancelClientUpdateRequestButton updateRequestId={request.id} />
              </div>
            ) : null}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
