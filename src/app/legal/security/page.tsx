import Link from "next/link";
import { LegalSupportFooter } from "@/components/legal-support/legal-support-footer";
import { Card, CardBody } from "@/components/ui/card";
import { getLegalSupportFooterConfig } from "@/lib/settings/legal-footer";

export const metadata = {
  title: "Security",
};

const accountProtection = [
  "Client portal access is limited to authorized users.",
  "Email verification may be required.",
  "One-time login codes may be required.",
  "Login codes expire after a short period.",
  "Client users can only access information connected to their own account.",
];

const passwordAndCodePractices = [
  "Passwords are not stored in plain text.",
  "Login codes are temporary.",
  "Used or expired codes cannot be reused.",
];

function SecuritySection({
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

export default async function SecurityPage() {
  const footerConfig = await getLegalSupportFooterConfig();

  return (
    <div className="flex min-h-screen flex-col px-4">
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          <Card>
            <CardBody className="py-10">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-slate-900">Security</h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                  OIS takes client portal security seriously. This page explains some of
                  the measures used to protect client access and information.
                </p>
              </div>

              <div className="mt-8 space-y-5">
                <SecuritySection title="Account Protection">
                  <ul className="list-disc space-y-2 pl-5">
                    {accountProtection.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </SecuritySection>

                <SecuritySection title="Data Access">
                  <p>
                    Clients can only view approved client-facing information. Internal notes,
                    internal activity, admin records, and private system information are not
                    shown in the client portal.
                  </p>
                </SecuritySection>

                <SecuritySection title="Passwords and Codes">
                  <ul className="list-disc space-y-2 pl-5">
                    {passwordAndCodePractices.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </SecuritySection>

                <SecuritySection title="Admin Controls">
                  <p>
                    OIS controls which projects, documents, invoices, tasks, and updates are
                    visible to clients.
                  </p>
                </SecuritySection>

                <SecuritySection title="Important Reminder">
                  <p>
                    Clients should not share login codes or portal credentials with unauthorized
                    people.
                  </p>
                </SecuritySection>

                <SecuritySection title="Report a Security Concern">
                  <p>
                    If you believe your account or information may be at risk, contact OIS
                    immediately at{" "}
                    <a href="mailto:oisolu7ions@gmail.com" className="underline hover:text-slate-900">
                      oisolu7ions@gmail.com
                    </a>
                    .
                  </p>
                </SecuritySection>
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
