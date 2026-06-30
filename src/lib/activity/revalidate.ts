import { revalidatePath } from "next/cache";

export function revalidateActivityPaths(options?: {
  leadId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
}) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/activity");

  if (options?.leadId) {
    revalidatePath(`/dashboard/leads/${options.leadId}`);
  }
  if (options?.clientId) {
    revalidatePath(`/dashboard/clients/${options.clientId}`);
  }
  if (options?.projectId) {
    revalidatePath(`/dashboard/projects/${options.projectId}`);
  }
  revalidatePath("/dashboard/update-requests");
}
