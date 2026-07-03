import { BackLink } from "@/components/layout/back-link";
import { PackageForm } from "@/components/packages/package-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "New package",
};

export default function NewPackagePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink fallbackHref="/dashboard/packages" />
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">New package</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add a new OIS service package for clients and projects.
        </p>
      </div>

      <Card>
        <CardHeader title="Package details" />
        <CardBody>
          <PackageForm mode="create" />
        </CardBody>
      </Card>
    </div>
  );
}
