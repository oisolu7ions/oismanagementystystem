import Link from "next/link";
import { Suspense } from "react";
import { searchPackages } from "@/actions/packages";
import { PackageSearch } from "@/components/packages/package-search";
import { PackageStatusBadge } from "@/components/packages/package-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";

type PackagesPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata = {
  title: "Packages",
};

export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  const { q } = await searchParams;
  const packages = await searchPackages(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Packages</h2>
          <p className="mt-1 text-sm text-slate-500">
            OIS service packages for websites, automation, and custom software.
          </p>
        </div>
        <Link href="/dashboard/packages/new">
          <Button>
            <Plus className="h-4 w-4" />
            New package
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader
          title="All packages"
          description={`${packages.length} package${packages.length === 1 ? "" : "s"}`}
        />
        <CardBody className="space-y-4">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-100" />}>
            <PackageSearch defaultValue={q ?? ""} />
          </Suspense>

          {packages.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              {q
                ? "No packages match your search."
                : "No packages yet. Create one or run the seed command."}
            </p>
          ) : (
            <ResponsiveTable>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Setup
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Monthly
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Features
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Clients
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
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/dashboard/packages/${pkg.id}`}
                          className="hover:underline"
                        >
                          {pkg.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{pkg.setupPrice}</td>
                      <td className="px-4 py-3 text-slate-600">{pkg.monthlyPrice}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {pkg.features.length}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {pkg._count.clients}
                      </td>
                      <td className="px-4 py-3">
                        <PackageStatusBadge isActive={pkg.isActive} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/packages/${pkg.id}/edit`}
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
