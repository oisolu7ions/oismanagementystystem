import Link from "next/link";
import { notFound } from "next/navigation";
import { getFollowUpById } from "@/actions/follow-ups";
import { FollowUpDeleteButton } from "@/components/follow-ups/follow-up-delete-button";
import { FollowUpDueDate } from "@/components/follow-ups/follow-up-due-date";
import { FollowUpQuickStatusSelect } from "@/components/follow-ups/follow-up-quick-status-select";
import { FollowUpReasonBadge } from "@/components/follow-ups/follow-up-reason-badge";
import { FollowUpStatusActions } from "@/components/follow-ups/follow-up-status-actions";
import { FollowUpStatusBadge } from "@/components/follow-ups/follow-up-status-badge";
import { getFollowUpReasonLabel } from "@/lib/follow-ups/constants";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type FollowUpDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: FollowUpDetailPageProps) {
  const { id } = await params;
  const followUp = await getFollowUpById(id);
  return {
    title: followUp
      ? getFollowUpReasonLabel(followUp.reason)
      : "Follow-up",
  };
}

export default async function FollowUpDetailPage({ params }: FollowUpDetailPageProps) {
  const { id } = await params;
  const followUp = await getFollowUpById(id);

  if (!followUp) {
    notFound();
  }

  const deleteLabel = getFollowUpReasonLabel(followUp.reason);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/follow-ups"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to follow-ups
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">
              {getFollowUpReasonLabel(followUp.reason)}
            </h2>
            <FollowUpStatusBadge status={followUp.status} />
            <FollowUpReasonBadge reason={followUp.reason} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/follow-ups/${followUp.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <FollowUpDeleteButton followUpId={followUp.id} label={deleteLabel} />
        </div>
      </div>

      <Card>
        <CardHeader title="Quick actions" />
        <CardBody className="space-y-4">
          <FollowUpStatusActions
            followUpId={followUp.id}
            currentStatus={followUp.status}
          />
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              Status dropdown
            </p>
            <FollowUpQuickStatusSelect
              followUpId={followUp.id}
              currentStatus={followUp.status}
            />
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Schedule" />
          <CardBody className="text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Follow-up date
            </p>
            <p className="mt-1">
              <FollowUpDueDate
                followUpDate={followUp.followUpDate}
                status={followUp.status}
              />
            </p>
            {followUp.completedAt ? (
              <p className="mt-3 text-slate-600">
                Completed: {followUp.completedAt.toLocaleString()}
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Related record" />
          <CardBody className="text-sm">
            {followUp.lead ? (
              <>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Lead
                </p>
                <p className="mt-1">
                  <Link
                    href={`/dashboard/leads/${followUp.lead.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {followUp.lead.name}
                  </Link>
                </p>
                {followUp.lead.businessName ? (
                  <p className="mt-1 text-slate-600">{followUp.lead.businessName}</p>
                ) : null}
              </>
            ) : followUp.client ? (
              <>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Client
                </p>
                <p className="mt-1">
                  <Link
                    href={`/dashboard/clients/${followUp.client.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {followUp.client.name}
                  </Link>
                </p>
                {followUp.client.businessName ? (
                  <p className="mt-1 text-slate-600">{followUp.client.businessName}</p>
                ) : null}
              </>
            ) : (
              <p className="text-slate-600">No lead or client linked</p>
            )}
          </CardBody>
        </Card>
      </div>

      {followUp.notes ? (
        <Card>
          <CardHeader title="Notes" />
          <CardBody>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {followUp.notes}
            </p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Record" />
        <CardBody className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-medium text-slate-700">Created:</span>{" "}
            {followUp.createdAt.toLocaleString()}
          </p>
          <p>
            <span className="font-medium text-slate-700">Updated:</span>{" "}
            {followUp.updatedAt.toLocaleString()}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
