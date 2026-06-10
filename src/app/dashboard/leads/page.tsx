import Link from "next/link";
import { Suspense } from "react";
import { searchLeads, type LeadSearchParams } from "@/actions/leads";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadSearch } from "@/components/leads/lead-search";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { formatFollowUpDate, getLeadSourceLabel } from "@/lib/leads/constants";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";

type LeadsPageProps = {
  searchParams: Promise<LeadSearchParams>;
};

export const metadata = {
  title: "Leads",
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;
  const leads = await searchLeads(params);
  const hasFilters = Boolean(params.q || params.status || params.source);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Leads</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track potential clients from first contact through proposal, won, or lost.
          </p>
        </div>
        <Link href="/dashboard/leads/new">
          <Button>
            <Plus className="h-4 w-4" />
            New lead
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader
          title="All leads"
          description={`${leads.length} lead${leads.length === 1 ? "" : "s"}`}
        />
        <CardBody className="space-y-4">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-100" />}>
            <LeadSearch defaultValue={params.q ?? ""} />
          </Suspense>
          <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-slate-100" />}>
            <LeadFilters
              currentStatus={params.status}
              currentSource={params.source}
            />
          </Suspense>

          {leads.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No leads found</p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try adjusting your search or filters."
                  : "Create your first lead to start tracking prospects."}
              </p>
              {!hasFilters ? (
                <Link href="/dashboard/leads/new" className="mt-4 inline-block">
                  <Button size="sm">Create lead</Button>
                </Link>
              ) : null}
            </div>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Business
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Service interest
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Follow-up
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="hover:underline"
                        >
                          {lead.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {lead.businessName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{lead.email ?? "—"}</div>
                        {lead.phone ? (
                          <div className="text-xs text-slate-500">{lead.phone}</div>
                        ) : null}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-slate-600">
                        {lead.serviceInterest ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {getLeadSourceLabel(lead.leadSource)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatFollowUpDate(lead.followUpDate)}
                      </td>
                      <td className="px-4 py-3">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/leads/${lead.id}/edit`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          Edit
                        </Link>
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
