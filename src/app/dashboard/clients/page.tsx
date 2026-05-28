import Link from "next/link";
import { Suspense } from "react";
import {
  getActivePackagesForFilter,
  searchClients,
  type ClientSearchParams,
} from "@/actions/clients";
import { ClientFilters } from "@/components/clients/client-filters";
import { ClientSearch } from "@/components/clients/client-search";
import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { PackageBadge } from "@/components/clients/package-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";

type ClientsPageProps = {
  searchParams: Promise<ClientSearchParams>;
};

export const metadata = {
  title: "Clients",
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;
  const [clients, packages] = await Promise.all([
    searchClients(params),
    getActivePackagesForFilter(),
  ]);
  const hasFilters = Boolean(params.q || params.status || params.packageId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Clients</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage active clients, service packages, and monthly plans.
          </p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button>
            <Plus className="h-4 w-4" />
            New client
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader
          title="All clients"
          description={`${clients.length} client${clients.length === 1 ? "" : "s"}`}
        />
        <CardBody className="space-y-4">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-100" />}>
            <ClientSearch defaultValue={params.q ?? ""} />
          </Suspense>
          <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-slate-100" />}>
            <ClientFilters
              currentStatus={params.status}
              currentPackageId={params.packageId}
              packages={packages}
            />
          </Suspense>

          {clients.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No clients found</p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try adjusting your search or filters."
                  : "Create your first client to start managing accounts."}
              </p>
              {!hasFilters ? (
                <Link href="/dashboard/clients/new" className="mt-4 inline-block">
                  <Button size="sm">Create client</Button>
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
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
                      Package
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Monthly plan
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Amount
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
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="hover:underline"
                        >
                          {client.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {client.businessName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{client.email ?? "—"}</div>
                        {client.phone ? (
                          <div className="text-xs text-slate-500">{client.phone}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        {client.package ? (
                          <PackageBadge
                            name={client.package.name}
                            isActive={client.package.isActive}
                          />
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-slate-600">
                        {client.monthlyPlan ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {client.monthlyAmount ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <ClientStatusBadge status={client.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/clients/${client.id}/edit`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
