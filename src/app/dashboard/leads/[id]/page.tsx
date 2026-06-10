import Link from "next/link";
import { notFound } from "next/navigation";
import { getFollowUpsByLeadId } from "@/actions/follow-ups";
import { getLeadById } from "@/actions/leads";
import { LeadFollowUpsSection } from "@/components/follow-ups/lead-follow-ups-section";
import { ConvertToClient } from "@/components/leads/convert-to-client";
import { LeadDeleteButton } from "@/components/leads/lead-delete-button";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import {
  formatFollowUpDate,
  getLeadSourceLabel,
} from "@/lib/leads/constants";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type LeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);
  return { title: lead?.name ?? "Lead" };
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const [lead, followUps] = await Promise.all([
    getLeadById(id),
    getFollowUpsByLeadId(id),
  ]);

  if (!lead) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/leads"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to leads
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{lead.name}</h2>
            <LeadStatusBadge status={lead.status} />
          </div>
          {lead.businessName ? (
            <p className="mt-1 text-sm text-slate-600">{lead.businessName}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/leads/${lead.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <LeadDeleteButton leadId={lead.id} leadName={lead.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Contact" />
          <CardBody className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </p>
              <p className="mt-1 text-slate-900">{lead.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Phone
              </p>
              <p className="mt-1 text-slate-900">{lead.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Website
              </p>
              <p className="mt-1 text-slate-900">
                {lead.website ? (
                  <a
                    href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-800 underline hover:text-slate-600"
                  >
                    {lead.website}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Pipeline" />
          <CardBody className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Industry
              </p>
              <p className="mt-1 text-slate-900">{lead.industry ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Service interest
              </p>
              <p className="mt-1 text-slate-900">{lead.serviceInterest ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Lead source
              </p>
              <p className="mt-1 text-slate-900">{getLeadSourceLabel(lead.leadSource)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Follow-up date
              </p>
              <p className="mt-1 text-slate-900">
                {formatFollowUpDate(lead.followUpDate)}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {lead.notes ? (
        <Card>
          <CardHeader title="Notes" />
          <CardBody>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {lead.notes}
            </p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Record" />
        <CardBody className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-medium text-slate-700">Created:</span>{" "}
            {lead.createdAt.toLocaleString()}
          </p>
          <p>
            <span className="font-medium text-slate-700">Updated:</span>{" "}
            {lead.updatedAt.toLocaleString()}
          </p>
        </CardBody>
      </Card>

      <LeadFollowUpsSection leadId={lead.id} followUps={followUps} />

      <Card>
        <CardHeader
          title="Activity timeline"
          description="Coming in a future phase."
        />
        <CardBody>
          <p className="text-sm text-slate-500">
            Calls, emails, status changes, and notes will appear here once activity
            tracking is enabled.
          </p>
        </CardBody>
      </Card>

      <ConvertToClient
        leadId={lead.id}
        leadName={lead.name}
        clientId={lead.clientId}
        clientName={lead.client?.name}
        convertedAt={lead.convertedAt}
      />
    </div>
  );
}
