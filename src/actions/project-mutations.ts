"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProjectActionState } from "@/lib/projects/action-state";
import { prisma } from "@/lib/prisma";
import { projectFormSchema, projectInputToDbFields } from "@/lib/validators/project";

function revalidateProjectPaths(id?: string, clientId?: string) {
  revalidatePath("/dashboard/projects");
  if (id) {
    revalidatePath(`/dashboard/projects/${id}`);
    revalidatePath(`/dashboard/projects/${id}/edit`);
  }
  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
}

function formatZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): ProjectActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

function parseProjectFormData(formData: FormData) {
  return projectFormSchema.safeParse({
    name: formData.get("name"),
    clientId: formData.get("clientId"),
    packageId: formData.get("packageId") ?? undefined,
    serviceType: formData.get("serviceType"),
    description: formData.get("description") ?? undefined,
    status: formData.get("status") ?? "NOT_STARTED",
    startDate: formData.get("startDate") ?? undefined,
    dueDate: formData.get("dueDate") ?? undefined,
    price: formData.get("price") ?? undefined,
    monthlyFee: formData.get("monthlyFee") ?? undefined,
  });
}

async function validateClientExists(clientId: string): Promise<string | null> {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return "Selected client not found";
  return null;
}

async function validatePackageAssignment(
  packageId: string | null | undefined,
  currentPackageId?: string | null,
): Promise<string | null> {
  if (!packageId) return null;

  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) return "Selected package not found";
  if (!pkg.isActive && packageId !== currentPackageId) {
    return "Inactive packages cannot be assigned to new projects";
  }
  return null;
}

export async function createProjectAction(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const parsed = parseProjectFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const clientError = await validateClientExists(parsed.data.clientId);
  if (clientError) {
    return { fieldErrors: { clientId: clientError } };
  }

  const packageError = await validatePackageAssignment(parsed.data.packageId);
  if (packageError) {
    return { fieldErrors: { packageId: packageError } };
  }

  const project = await prisma.project.create({
    data: projectInputToDbFields(parsed.data),
  });

  revalidateProjectPaths(project.id, project.clientId);
  redirect(`/dashboard/projects/${project.id}`);
}

export async function updateProjectAction(
  id: string,
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Project not found" };
  }

  const parsed = parseProjectFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const clientError = await validateClientExists(parsed.data.clientId);
  if (clientError) {
    return { fieldErrors: { clientId: clientError } };
  }

  const packageError = await validatePackageAssignment(
    parsed.data.packageId,
    existing.packageId,
  );
  if (packageError) {
    return { fieldErrors: { packageId: packageError } };
  }

  const project = await prisma.project.update({
    where: { id },
    data: projectInputToDbFields(parsed.data),
  });

  revalidateProjectPaths(id, project.clientId);
  if (existing.clientId !== project.clientId) {
    revalidateProjectPaths(undefined, existing.clientId);
  }

  redirect(`/dashboard/projects/${id}`);
}

export async function deleteProjectAction(
  id: string,
): Promise<ProjectActionState & { success?: boolean }> {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return { error: "Project not found" };
  }

  await prisma.project.delete({ where: { id } });
  revalidateProjectPaths(undefined, project.clientId);
  return { success: true };
}
