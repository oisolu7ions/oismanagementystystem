import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackageById } from "@/actions/packages";
import { PackageDeleteButton } from "@/components/packages/package-delete-button";
import { PackageStatusBadge } from "@/components/packages/package-status-badge";
import { PackageToggleActive } from "@/components/packages/package-toggle-active";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type PackageDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PackageDetailPageProps) {
  const { id } = await params;
  const pkg = await getPackageById(id);
  return { title: pkg?.name ?? "Package" };
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { id } = await params;
  const pkg = await getPackageById(id);

  if (!pkg) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/packages"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to packages
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{pkg.name}</h2>
            <PackageStatusBadge isActive={pkg.isActive} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {pkg._count.clients} client{pkg._count.clients === 1 ? "" : "s"} ·{" "}
            {pkg._count.projects} project{pkg._count.projects === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/packages/${pkg.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <PackageToggleActive packageId={pkg.id} isActive={pkg.isActive} />
          <PackageDeleteButton packageId={pkg.id} packageName={pkg.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Pricing" />
          <CardBody className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Setup
              </p>
              <p className="mt-1 text-sm text-slate-900">{pkg.setupPrice}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Monthly
              </p>
              <p className="mt-1 text-sm text-slate-900">{pkg.monthlyPrice}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Overview" />
          <CardBody className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-700">Features:</span>{" "}
              {pkg.features.length}
            </p>
            <p>
              <span className="font-medium text-slate-700">Updated:</span>{" "}
              {pkg.updatedAt.toLocaleDateString()}
            </p>
          </CardBody>
        </Card>
      </div>

      {pkg.description ? (
        <Card>
          <CardHeader title="Description" />
          <CardBody>
            <p className="text-sm leading-relaxed text-slate-700">{pkg.description}</p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="Features"
          description={`${pkg.features.length} included in this package`}
        />
        <CardBody>
          {pkg.features.length === 0 ? (
            <p className="text-sm text-slate-500">No features listed.</p>
          ) : (
            <ul className="list-inside list-disc space-y-2 text-sm text-slate-700">
              {pkg.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
