import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { getPackageById } from "@/actions/packages";
import { PackageForm } from "@/components/packages/package-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type EditPackagePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditPackagePageProps) {
  const { id } = await params;
  const pkg = await getPackageById(id);
  return { title: pkg ? `Edit ${pkg.name}` : "Edit package" };
}

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  const { id } = await params;
  const pkg = await getPackageById(id);

  if (!pkg) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref={`/dashboard/packages/${pkg.id}`} />
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          Edit {pkg.name}
        </h2>
      </div>

      <Card>
        <CardHeader title="Package details" />
        <CardBody>
          <PackageForm
            mode="edit"
            packageId={pkg.id}
            initialValues={{
              name: pkg.name,
              setupPrice: pkg.setupPrice,
              monthlyPrice: pkg.monthlyPrice,
              description: pkg.description ?? "",
              features: pkg.features,
              isActive: pkg.isActive,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
