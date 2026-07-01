import Link from "next/link";
import { ClientLoginCodeForm } from "@/components/client-portal/client-login-code-form";
import { ClientBrand } from "@/components/client-portal/client-brand";
import { LegalSupportFooter } from "@/components/legal-support/legal-support-footer";
import { Card, CardBody } from "@/components/ui/card";
import { getClientLoginChallenge } from "@/lib/auth/client-session";
import { getLegalSupportFooterConfig } from "@/lib/settings/legal-footer";

export const metadata = {
  title: "Enter login code",
};

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"*".repeat(Math.max(2, name.length - 2))}@${domain}`;
}

export default async function ClientLoginCodePage() {
  const [challenge, footerConfig] = await Promise.all([
    getClientLoginChallenge(),
    getLegalSupportFooterConfig(),
  ]);

  return (
    <div className="flex min-h-screen flex-col px-4">
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <ClientBrand linked={false} size="large" showLogo={false} />
          </div>

          <Card>
            <CardBody className="py-6">
              {challenge ? (
                <div className="space-y-5">
                  <div className="text-center">
                    <h1 className="text-xl font-semibold text-slate-900">Check your email</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      We sent a one-time code to {maskEmail(challenge.email)}.
                    </p>
                  </div>
                  <ClientLoginCodeForm />
                </div>
              ) : (
                <div className="text-center">
                  <h1 className="text-xl font-semibold text-slate-900">Code expired</h1>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Please sign in again to receive a new one-time code.
                  </p>
                  <Link
                    href="/client/login"
                    className="mt-6 inline-flex text-sm font-medium text-slate-700 underline hover:text-slate-900"
                  >
                    Back to client sign in
                  </Link>
                </div>
              )}
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
