import Link from "next/link";
import { LegalSupportFooter } from "@/components/legal-support/legal-support-footer";
import { Card, CardBody } from "@/components/ui/card";
import { getLegalSupportFooterConfig } from "@/lib/settings/legal-footer";

export const metadata = {
  title: "Accessibility Statement",
};

const accessibilityEfforts = [
  "Clear page structure",
  "Readable text",
  "Keyboard-friendly navigation where possible",
  "Sufficient color contrast",
  "Descriptive labels and buttons",
  "Mobile-friendly layouts",
];

const feedbackDetails = [
  "The page you were trying to access",
  "The issue you experienced",
  "The device and browser you were using",
  "Any assistive technology used, if applicable",
];

function AccessibilitySection({
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

export default async function AccessibilityPage() {
  const footerConfig = await getLegalSupportFooterConfig();

  return (
    <div className="flex min-h-screen flex-col px-4">
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          <Card>
            <CardBody className="py-10">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-slate-900">Accessibility Statement</h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                  OIS is committed to making the client portal usable and accessible to as
                  many people as possible.
                </p>
              </div>

              <div className="mt-8 space-y-5">
                <AccessibilitySection title="Our Goal">
                  <p>
                    We aim to provide a clean, readable, and easy-to-use experience across
                    desktop and mobile devices.
                  </p>
                </AccessibilitySection>

                <AccessibilitySection title="Accessibility Efforts">
                  <p>We work to support:</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5">
                    {accessibilityEfforts.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </AccessibilitySection>

                <AccessibilitySection title="Feedback">
                  <p>
                    If you have trouble accessing any part of the OIS client portal, please
                    contact us.
                  </p>
                  <p className="mt-3">When contacting us, please include:</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5">
                    {feedbackDetails.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </AccessibilitySection>

                <AccessibilitySection title="Contact">
                  <p>
                    <a href="mailto:oisolu7ions@gmail.com" className="underline hover:text-slate-900">
                      oisolu7ions@gmail.com
                    </a>
                  </p>
                </AccessibilitySection>
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
