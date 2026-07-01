import Link from "next/link";
import { verifyClientEmailToken } from "@/actions/client-portal-auth";
import { ClientBrand } from "@/components/client-portal/client-brand";
import { LegalSupportFooter } from "@/components/legal-support/legal-support-footer";
import { Card, CardBody } from "@/components/ui/card";
import { getLegalSupportFooterConfig } from "@/lib/settings/legal-footer";

type ClientVerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export const metadata = {
  title: "Verify email",
};

export default async function ClientVerifyEmailPage({ searchParams }: ClientVerifyEmailPageProps) {
  const [{ token }, footerConfig] = await Promise.all([
    searchParams,
    getLegalSupportFooterConfig(),
  ]);
  const result = token
    ? await verifyClientEmailToken(token)
    : { status: "error" as const, message: "This verification link is missing a token." };

  const isSuccess = result.status === "success";

  return (
    <div className="flex min-h-screen flex-col px-4">
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <ClientBrand linked={false} size="large" showLogo={false} />
          </div>
          <Card>
            <CardBody className="py-8 text-center">
              <h1 className="text-xl font-semibold text-slate-900">
                {isSuccess ? "Email verified" : "Verification failed"}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">{result.message}</p>
              <div className="mt-6 flex flex-col items-center gap-3 text-sm">
                <Link href="/client/login" className="font-medium text-slate-700 underline hover:text-slate-900">
                  Go to client sign in
                </Link>
                {!isSuccess ? (
                  <Link href="/client/resend-verification" className="text-slate-500 underline hover:text-slate-700">
                    Resend verification email
                  </Link>
                ) : null}
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
      {footerConfig.showFooterOnAuthPages ? (
        <LegalSupportFooter className="pb-6" links={footerConfig.links} />
      ) : null}
    </div>
  );
}
