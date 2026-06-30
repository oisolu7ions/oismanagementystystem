import { getClientProfile } from "@/lib/client-portal/queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "Account",
};

function formatWebsite(url: string | null) {
  if (!url) return null;
  const href = url.startsWith("http") ? url : `https://${url}`;
  return { href, label: url };
}

export default async function ClientAccountPage() {
  const session = await requireClientPortalSession();
  const profile = await getClientProfile(session.clientId);

  if (!profile) {
    return null;
  }

  const website = formatWebsite(profile.website);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Account</h1>
        <p className="mt-1 text-sm text-slate-500">Your portal profile and company details.</p>
      </div>

      <Card>
        <CardHeader title="Signed in as" />
        <CardBody className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Name</p>
            <p className="mt-1 text-slate-900">{session.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</p>
            <p className="mt-1 text-slate-900">{session.email}</p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Company profile" />
        <CardBody className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Company
            </p>
            <p className="mt-1 text-slate-900">{profile.name}</p>
            {profile.businessName ? (
              <p className="mt-0.5 text-slate-600">{profile.businessName}</p>
            ) : null}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Contact email
            </p>
            <p className="mt-1 text-slate-900">{profile.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Phone</p>
            <p className="mt-1 text-slate-900">{profile.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Website
            </p>
            <p className="mt-1 text-slate-900">
              {website ? (
                <a
                  href={website.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-600"
                >
                  {website.label}
                </a>
              ) : (
                "—"
              )}
            </p>
          </div>
          {profile.package ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                OIS package
              </p>
              <p className="mt-1 text-slate-900">{profile.package.name}</p>
            </div>
          ) : null}
          {profile.monthlyPlan ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Monthly plan
              </p>
              <p className="mt-1 text-slate-900">{profile.monthlyPlan}</p>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
