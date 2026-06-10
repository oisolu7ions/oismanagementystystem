import Link from "next/link";
import type { FollowUpReason, FollowUpStatus } from "@/generated/prisma/client";
import { FollowUpDueDate } from "@/components/follow-ups/follow-up-due-date";
import { FollowUpReasonBadge } from "@/components/follow-ups/follow-up-reason-badge";
import { FollowUpStatusBadge } from "@/components/follow-ups/follow-up-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";

type LeadFollowUp = {
  id: string;
  reason: FollowUpReason;
  status: FollowUpStatus;
  followUpDate: Date;
};

export function LeadFollowUpsSection({
  leadId,
  followUps,
}: {
  leadId: string;
  followUps: LeadFollowUp[];
}) {
  return (
    <Card>
      <CardHeader
        title="Follow-ups"
        description={`${followUps.length} follow-up${followUps.length === 1 ? "" : "s"}`}
        action={
          <Link href={`/dashboard/follow-ups/new?leadId=${leadId}`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New follow-up
            </Button>
          </Link>
        }
      />
      <CardBody>
        {followUps.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No follow-ups yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Schedule proposal, consultation, or other reminders for this lead.
            </p>
            <Link
              href={`/dashboard/follow-ups/new?leadId=${leadId}`}
              className="mt-4 inline-block"
            >
              <Button size="sm">Schedule follow-up</Button>
            </Link>
          </div>
        ) : (
          <ResponsiveTable>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {followUps.map((followUp) => (
                  <tr key={followUp.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/follow-ups/${followUp.id}`}
                        className="inline-flex hover:underline"
                      >
                        <FollowUpReasonBadge reason={followUp.reason} />
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <FollowUpDueDate
                        followUpDate={followUp.followUpDate}
                        status={followUp.status}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <FollowUpStatusBadge status={followUp.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        )}
      </CardBody>
    </Card>
  );
}
