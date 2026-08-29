import Link from "next/link";
import { AdminMfaForm } from "@/components/auth/admin-mfa-form";
import { AppBrand } from "@/components/layout/app-brand";
import { Card, CardBody } from "@/components/ui/card";
import { getAdminMfaChallenge } from "@/lib/auth/admin-mfa-challenge";

export const metadata = {
  title: "Verify sign in",
};

export default async function AdminMfaLoginPage() {
  const challenge = await getAdminMfaChallenge();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <AppBrand linked={false} showTagline={false} size="large" showLogo={false} className="justify-center" />
        </div>

        <Card>
          <CardBody className="py-6">
            {challenge ? (
              <div className="space-y-5">
                <div className="text-center">
                  <h1 className="text-xl font-semibold text-slate-900">
                    Two-factor authentication
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter the 6-digit code from your authenticator app for{" "}
                    <span className="font-medium text-slate-700">{challenge.email}</span>.
                  </p>
                </div>
                <AdminMfaForm />
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-xl font-semibold text-slate-900">Verification expired</h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Please sign in again to continue.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex text-sm font-medium text-slate-700 underline hover:text-slate-900"
                >
                  Back to sign in
                </Link>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
