import Link from "next/link";
import { LegalSupportFooter } from "@/components/legal-support/legal-support-footer";
import { Card, CardBody } from "@/components/ui/card";
import { getLegalSupportFooterConfig } from "@/lib/settings/legal-footer";

export const metadata = {
  title: "Terms & Conditions",
};

const clientResponsibilities = [
  "Providing accurate information",
  "Reviewing project details",
  "Submitting requested content on time",
  "Keeping login credentials secure",
  "Not sharing portal access with unauthorized users",
];

function TermsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 px-4 py-4">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-slate-600">{children}</div>
    </section>
  );
}

export default async function TermsPage() {
  const footerConfig = await getLegalSupportFooterConfig();

  return (
    <div className="flex min-h-screen flex-col px-4">
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          <Card>
            <CardBody className="py-10">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-slate-900">Terms &amp; Conditions</h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                  By using the OIS client portal, you agree to use it responsibly and only
                  for your authorized business account.
                </p>
              </div>

              <div className="mt-8 space-y-5">
                <TermsSection title="Portal Use">
                  <p>
                    The client portal is provided to help clients view project information,
                    invoices, documents, updates, and submit requests.
                  </p>
                </TermsSection>

                <TermsSection title="Authorized Access">
                  <p>
                    You may only access information connected to your business or account. Do
                    not attempt to access another client's data.
                  </p>
                </TermsSection>

                <TermsSection title="Client Responsibilities">
                  <p>Clients are responsible for:</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5">
                    {clientResponsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </TermsSection>

                <TermsSection title="Update Requests">
                  <p>
                    Requests submitted through the portal may be reviewed, approved, declined,
                    scheduled, or priced by OIS depending on scope.
                  </p>
                </TermsSection>

                <TermsSection title="Invoices and Payments">
                  <p>
                    Invoices shown in the portal are for tracking and reference. Payment links
                    may direct to third-party payment services.
                  </p>
                </TermsSection>

                <TermsSection title="Service Changes">
                  <p>
                    OIS may update the portal, features, terms, or access rules as needed.
                  </p>
                </TermsSection>

                <TermsSection title="No Misuse">
                  <p>
                    You may not use the portal to upload harmful files, attempt unauthorized
                    access, interfere with the system, or abuse OIS services.
                  </p>
                </TermsSection>

                <TermsSection title="Limitation">
                  <p>
                    The portal is provided as a business support tool. OIS is not responsible
                    for issues caused by misuse, unauthorized access caused by shared
                    credentials, or third-party service outages.
                  </p>
                </TermsSection>

                <TermsSection title="Contact">
                  <p>
                    For questions about these terms, contact OIS at{" "}
                    <a href="mailto:oisolu7ions@gmail.com" className="underline hover:text-slate-900">
                      oisolu7ions@gmail.com
                    </a>
                    .
                  </p>
                </TermsSection>
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
