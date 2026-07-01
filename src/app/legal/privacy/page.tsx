import Link from "next/link";
import { LegalSupportFooter } from "@/components/legal-support/legal-support-footer";
import { Card, CardBody } from "@/components/ui/card";
import { getLegalSupportFooterConfig } from "@/lib/settings/legal-footer";

export const metadata = {
  title: "Privacy Policy",
};

const collectedInformation = [
  "Name",
  "Email address",
  "Phone number",
  "Business name",
  "Project details",
  "Update requests",
  "Uploaded files or document links",
  "Invoice and payment status",
  "Client portal login activity",
];

const informationUses = [
  "To manage client projects",
  "To provide website, software, automation, and support services",
  "To send client portal access emails",
  "To verify account access",
  "To respond to update requests",
  "To manage invoices and documents",
  "To improve our internal business systems",
];

const privacyCommitments = [
  "We do not sell client information.",
  "We do not intentionally share private client information with unrelated third parties.",
  "We do not store credit card numbers inside the client portal.",
];

function PolicySection({
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

export default async function PrivacyPage() {
  const footerConfig = await getLegalSupportFooterConfig();

  return (
    <div className="flex min-h-screen flex-col px-4">
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          <Card>
            <CardBody className="py-10">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-slate-900">Privacy Policy</h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                  OIS respects your privacy. This page explains what information we collect,
                  how we use it, and how we protect it.
                </p>
              </div>

              <div className="mt-8 space-y-5">
                <PolicySection title="Information We May Collect">
                  <ul className="list-disc space-y-2 pl-5">
                    {collectedInformation.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </PolicySection>

                <PolicySection title="How We Use Information">
                  <ul className="list-disc space-y-2 pl-5">
                    {informationUses.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </PolicySection>

                <PolicySection title="What We Do Not Do">
                  <ul className="list-disc space-y-2 pl-5">
                    {privacyCommitments.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </PolicySection>

                <PolicySection title="Data Security">
                  <p>
                    We use reasonable administrative, technical, and access controls to protect
                    client information.
                  </p>
                </PolicySection>

                <PolicySection title="Third-Party Services">
                  <p>
                    OIS may use trusted services for hosting, email delivery, analytics, file
                    storage, or project support.
                  </p>
                </PolicySection>

                <PolicySection title="Contact">
                  <p>
                    For privacy questions, contact OIS at{" "}
                    <a href="mailto:oisolu7ions@gmail.com" className="underline hover:text-slate-900">
                      oisolu7ions@gmail.com
                    </a>
                    .
                  </p>
                </PolicySection>
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
