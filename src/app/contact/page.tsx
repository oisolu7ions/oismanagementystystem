import Link from "next/link";
import { LegalSupportFooter } from "@/components/legal-support/legal-support-footer";
import { Card, CardBody } from "@/components/ui/card";
import { getLegalSupportFooterConfig } from "@/lib/settings/legal-footer";

export const metadata = {
  title: "Contact OIS",
};

export default async function ContactPage() {
  const footerConfig = await getLegalSupportFooterConfig();

  return (
    <div className="flex min-h-screen flex-col px-4">
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          <Card>
            <CardBody className="py-10">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-slate-900">Contact OIS</h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                  Need help with your client portal, website, project, invoice, or update request?
                  Contact us using the information below.
                </p>
              </div>

              <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <dt className="font-medium text-slate-900">Email</dt>
                  <dd className="mt-1 text-slate-600">
                    <a href="mailto:oisolu7ions@gmail.com" className="underline hover:text-slate-900">
                      oisolu7ions@gmail.com
                    </a>
                  </dd>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <dt className="font-medium text-slate-900">Phone</dt>
                  <dd className="mt-1 text-slate-600">
                    <a href="tel:+19195882658" className="underline hover:text-slate-900">
                      +1 (919) 588-2658
                    </a>
                  </dd>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <dt className="font-medium text-slate-900">Business</dt>
                  <dd className="mt-1 text-slate-600">Owolabi IT Solutions / OIS</dd>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <dt className="font-medium text-slate-900">Support Hours</dt>
                  <dd className="mt-1 text-slate-600">Monday - Friday, 9:00 AM - 5:00 PM</dd>
                </div>
              </dl>

              <div className="mt-8 rounded-lg border border-slate-200 px-4 py-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  For urgent website or system issues, please include:
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                  <li>Your business name</li>
                  <li>The issue you are experiencing</li>
                  <li>Screenshots if available</li>
                  <li>The page or system affected</li>
                </ul>
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/client/login"
                  className="inline-flex text-sm font-medium text-slate-700 underline hover:text-slate-900"
                >
                  Back to client sign in
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
      <LegalSupportFooter className="pb-6" links={footerConfig.links} />
    </div>
  );
}
