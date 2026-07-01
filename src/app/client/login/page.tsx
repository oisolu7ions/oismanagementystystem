import { ClientLoginForm } from "@/components/client-portal/client-login-form";
import { ClientBrand } from "@/components/client-portal/client-brand";
import { LegalSupportFooter } from "@/components/legal-support/legal-support-footer";
import { Card, CardBody } from "@/components/ui/card";
import { getLegalSupportFooterConfig } from "@/lib/settings/legal-footer";

export const metadata = {
  title: "Client sign in",
};

export default async function ClientLoginPage() {
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
              <ClientLoginForm />
            </CardBody>
          </Card>

          <p className="mt-6 text-center text-xs text-slate-400">
            OIS team member?{" "}
            <a href="/login" className="underline hover:text-slate-600">
              Admin sign in
            </a>
          </p>
        </div>
      </main>
      {footerConfig.showFooterOnAuthPages ? (
        <LegalSupportFooter className="pb-6" links={footerConfig.links} />
      ) : null}
    </div>
  );
}
