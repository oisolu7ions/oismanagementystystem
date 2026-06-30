import Link from "next/link";
import { getClientPortalUpdates } from "@/lib/client-portal/queries";
import { requireClientPortalSession } from "@/lib/client-portal/require-session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "Project Updates",
};

export default async function ClientUpdatesPage() {
  const session = await requireClientPortalSession();
  const updates = await getClientPortalUpdates(session.clientId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/client/dashboard"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to overview
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          Project Updates
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Updates shared with you by the OIS team.
        </p>
      </div>

      <Card>
        <CardHeader
          title="All updates"
          description={`${updates.length} update${updates.length === 1 ? "" : "s"}`}
        />
        <CardBody className="space-y-3">
          {updates.length === 0 ? (
            <p className="text-sm text-slate-500">No updates to display yet.</p>
          ) : (
            updates.map((update) => (
              <div
                key={update.id}
                className="rounded-lg border border-slate-200 p-4 text-sm"
              >
                <p className="text-slate-800">{update.displayMessage}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {update.project?.name ? (
                    <>
                      <Link
                        href={`/client/projects/${update.project.id}`}
                        className="font-medium hover:underline"
                      >
                        {update.project.name}
                      </Link>
                      {" · "}
                    </>
                  ) : null}
                  {update.createdAt.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
