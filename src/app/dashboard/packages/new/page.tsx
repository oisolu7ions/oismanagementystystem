import Link from "next/link";
import { PackageForm } from "@/components/packages/package-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "New package",
};

export default function NewPackagePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/packages"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to packages
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">New package</h2>
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
