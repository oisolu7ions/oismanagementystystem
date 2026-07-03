import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { getClientById } from "@/actions/clients";
import { getActivityByClientId } from "@/actions/activity";
import { getUpdateRequestsByClientId } from "@/actions/update-requests";
import {
  getClientPortalAccessSummary,
  getClientUsersByClientId,
} from "@/actions/client-portal-users";
import { getDocumentsByClientId } from "@/actions/documents";
import { getFollowUpsByClientId } from "@/actions/follow-ups";
import { ClientDocumentsSection } from "@/components/documents/client-documents-section";
import { getInvoicesByClientId } from "@/actions/invoices";
import { ClientFollowUpsSection } from "@/components/follow-ups/client-follow-ups-section";
import { getProjectsByClientId } from "@/actions/projects";
import { ClientInvoicesSection } from "@/components/invoices/client-invoices-section";
import { ClientProjectsSection } from "@/components/projects/client-projects-section";
import { ConvertedFromLeadBanner } from "@/components/clients/converted-from-lead-banner";
import { ClientPortalControlsSection } from "@/components/clients/client-portal-controls-section";
import { ClientUpdateRequestsSection } from "@/components/update-requests/update-request-sections";
import { ClientDeleteButton } from "@/components/clients/client-delete-button";
import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { ActivityAdminTimeline } from "@/components/client-sharing/activity-admin-timeline";
import { PackageBadge } from "@/components/clients/package-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type ClientDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ convertedFromLead?: string }>;
};

export async function generateMetadata({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const client = await getClientById(id);
  return { title: client?.name ?? "Client" };
}

function formatWebsite(url: string | null) {
  if (!url) return null;
  const href = url.startsWith("http") ? url : `https://${url}`;
  return { href, label: url };
}

export default async function ClientDetailPage({
  params,
  searchParams,
}: ClientDetailPageProps) {
  const { id } = await params;
  const { convertedFromLead } = await searchParams;
  const [client, projects, invoices, followUps, documents, activities, portalUsers, portalAccess, updateRequests] =
    await Promise.all([
    getClientById(id),
    getProjectsByClientId(id),
    getInvoicesByClientId(id),
    getFollowUpsByClientId(id),
    getDocumentsByClientId(id),
    getActivityByClientId(id),
    getClientUsersByClientId(id),
    getClientPortalAccessSummary(id),
    getUpdateRequestsByClientId(id),
  ]);

  if (!client) {
    notFound();
  }

  const website = formatWebsite(client.website);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {convertedFromLead === "1" ? <ConvertedFromLeadBanner /> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <BackLink fallbackHref="/dashboard/clients" />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{client.name}</h2>
            <ClientStatusBadge status={client.status} />
          </div>
          {client.businessName ? (
            <p className="mt-1 text-sm text-slate-600">{client.businessName}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/clients/${client.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <ClientDeleteButton clientId={client.id} clientName={client.name} />
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
              <p className="mt-1 text-slate-900">{client.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Phone
              </p>
              <p className="mt-1 text-slate-900">{client.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Website
              </p>
              <p className="mt-1 text-slate-900">
                {website ? (
                  <a
                    href={website.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-slate-600"
                  >
                    {website.label}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Address
              </p>
              <p className="mt-1 whitespace-pre-wrap text-slate-900">
                {client.address ?? "—"}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Service plan" />
          <CardBody className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                OIS package
              </p>
              <div className="mt-1">
                {client.package ? (
                  <PackageBadge
                    name={client.package.name}
                    isActive={client.package.isActive}
                  />
                ) : (
                  <span className="text-slate-600">No package assigned</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Monthly plan
              </p>
              <p className="mt-1 text-slate-900">{client.monthlyPlan ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Monthly amount
              </p>
              <p className="mt-1 text-slate-900">{client.monthlyAmount ?? "—"}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {client.notes ? (
        <Card>
          <CardHeader title="Notes" />
          <CardBody>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {client.notes}
            </p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Record" />
        <CardBody className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-medium text-slate-700">Created:</span>{" "}
            {client.createdAt.toLocaleString()}
          </p>
          <p>
            <span className="font-medium text-slate-700">Updated:</span>{" "}
            {client.updatedAt.toLocaleString()}
          </p>
        </CardBody>
      </Card>

      <ClientProjectsSection clientId={client.id} projects={projects} />

      <ClientInvoicesSection clientId={client.id} invoices={invoices} />

      <ClientFollowUpsSection clientId={client.id} followUps={followUps} />

      <ClientUpdateRequestsSection clientId={client.id} updateRequests={updateRequests} />

      <ClientDocumentsSection clientId={client.id} documents={documents} />

      <Card>
        <CardHeader
          title="Client Portal Controls"
          description="Portal users and visibility management for this client"
        />
        <CardBody>
          <ClientPortalControlsSection
            clientId={client.id}
            users={portalUsers}
            hasPortalAccess={portalAccess.hasPortalAccess}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Client notes" description="Coming in a future phase." />
        <CardBody>
          <p className="text-sm text-slate-500">
            Structured note records ({client._count.noteRecords} planned) will
            complement the profile notes field above.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Activity timeline"
          description="Automatic history for this client"
        />
        <CardBody>
          <ActivityAdminTimeline activities={activities} />
        </CardBody>
      </Card>
    </div>
  );
}
