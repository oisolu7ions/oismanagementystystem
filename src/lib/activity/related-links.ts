import type { ActivityRecord } from "@/actions/activity";
import { getFollowUpReasonLabel } from "@/lib/follow-ups/constants";

export type ActivityRelatedLink = {
  href: string;
  label: string;
};

export function getActivityRelatedLinks(
  activity: ActivityRecord,
): ActivityRelatedLink[] {
  const links: ActivityRelatedLink[] = [];

  if (activity.lead) {
    links.push({
      href: `/dashboard/leads/${activity.lead.id}`,
      label: activity.lead.name,
    });
  }
  if (activity.client) {
    links.push({
      href: `/dashboard/clients/${activity.client.id}`,
      label: activity.client.name,
    });
  }
  if (activity.project) {
    links.push({
      href: `/dashboard/projects/${activity.project.id}`,
      label: activity.project.name,
    });
  }
  if (activity.task) {
    links.push({
      href: `/dashboard/tasks/${activity.task.id}`,
      label: activity.task.title,
    });
  }
  if (activity.invoice) {
    links.push({
      href: `/dashboard/invoices/${activity.invoice.id}`,
      label: activity.invoice.invoiceNumber,
    });
  }
  if (activity.followUp) {
    links.push({
      href: `/dashboard/follow-ups/${activity.followUp.id}`,
      label: getFollowUpReasonLabel(activity.followUp.reason),
    });
  }
  if (activity.note) {
    links.push({
      href: `/dashboard/clients/${activity.clientId ?? ""}`,
      label: activity.note.title ?? "Note",
    });
  }
  if (activity.documentLink) {
    links.push({
      href: `/dashboard/documents/${activity.documentLink.id}`,
      label: activity.documentLink.name,
    });
  }

  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}
