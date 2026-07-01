import { ClientBrand } from "@/components/client-portal/client-brand";
import { ResendVerificationForm } from "@/components/client-portal/resend-verification-form";
import { LegalSupportFooter } from "@/components/legal-support/legal-support-footer";
import { Card, CardBody } from "@/components/ui/card";
import { getLegalSupportFooterConfig } from "@/lib/settings/legal-footer";

export const metadata = {
  title: "Resend verification",
};

export default async function ClientResendVerificationPage() {
  const footerConfig = await getLegalSupportFooterConfig();

  return (
    <div className="flex min-h-screen flex-col px-4">
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <ClientBrand linked={false} size="large" showLogo={false} />
          </div>
          <Card>
            <CardBody className="py-6">
              <div className="mb-5 text-center">
                <h1 className="text-xl font-semibold text-slate-900">Resend verification email</h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your portal email and we will send a fresh verification link if the account exists.
                </p>
              </div>
              <ResendVerificationForm />
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
