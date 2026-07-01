import Link from "next/link";
import { ClientBrand } from "@/components/client-portal/client-brand";
import { LegalSupportFooter } from "@/components/legal-support/legal-support-footer";
import { Card, CardBody } from "@/components/ui/card";
import { getLegalSupportFooterConfig } from "@/lib/settings/legal-footer";

export async function ClientAuthPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const footerConfig = await getLegalSupportFooterConfig();

  return (
    <div className="flex min-h-screen flex-col px-4">
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <ClientBrand linked={false} size="large" showLogo={false} />
          </div>
          <Card>
            <CardBody className="py-8 text-center">
              <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
              <Link
                href="/client/login"
                className="mt-6 inline-flex text-sm font-medium text-slate-700 underline hover:text-slate-900"
              >
                Back to client sign in
              </Link>
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
