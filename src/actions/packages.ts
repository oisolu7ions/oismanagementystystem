"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { packageFormSchema, packageInputToDbFields } from "@/lib/validators/package";

export type PackageActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function revalidatePackagePaths(id?: string) {
  revalidatePath("/dashboard/packages");
  if (id) {
    revalidatePath(`/dashboard/packages/${id}`);
    revalidatePath(`/dashboard/packages/${id}/edit`);
  }
}

function formatZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): PackageActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

export async function createPackageAction(
  _prevState: PackageActionState,
  formData: FormData,
): Promise<PackageActionState> {
  const parsed = packageFormSchema.safeParse({
    name: formData.get("name"),
    setupPrice: formData.get("setupPrice"),
    monthlyPrice: formData.get("monthlyPrice"),
    description: formData.get("description") ?? undefined,
    features: formData.get("features") ?? undefined,
    isActive: formData.get("isActive") ?? "true",
  });

  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const existing = await prisma.package.findFirst({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { fieldErrors: { name: "A package with this name already exists" } };
  }

  const pkg = await prisma.package.create({
    data: packageInputToDbFields(parsed.data),
  });

  revalidatePackagePaths(pkg.id);
  redirect(`/dashboard/packages/${pkg.id}`);
}

export async function updatePackageAction(
  id: string,
  _prevState: PackageActionState,
  formData: FormData,
): Promise<PackageActionState> {
  const parsed = packageFormSchema.safeParse({
    name: formData.get("name"),
    setupPrice: formData.get("setupPrice"),
    monthlyPrice: formData.get("monthlyPrice"),
    description: formData.get("description") ?? undefined,
    features: formData.get("features") ?? undefined,
    isActive: formData.get("isActive") ?? "true",
  });

  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const duplicate = await prisma.package.findFirst({
    where: { name: parsed.data.name, id: { not: id } },
  });
  if (duplicate) {
    return { fieldErrors: { name: "A package with this name already exists" } };
  }

  await prisma.package.update({
    where: { id },
    data: packageInputToDbFields(parsed.data),
  });

  revalidatePackagePaths(id);
  redirect(`/dashboard/packages/${id}`);
}

export async function deletePackageAction(
  id: string,
): Promise<PackageActionState & { success?: boolean }> {
  const pkg = await prisma.package.findUnique({
    where: { id },
    include: {
      _count: { select: { clients: true, projects: true } },
    },
  });

  if (!pkg) {
    return { error: "Package not found" };
  }

  if (pkg._count.clients > 0 || pkg._count.projects > 0) {
    return {
      error:
        "Cannot delete a package linked to clients or projects. Deactivate it instead.",
    };
  }

  await prisma.package.delete({ where: { id } });
  revalidatePath("/dashboard/packages");
  return { success: true };
}

export async function togglePackageActiveAction(
  id: string,
  isActive: boolean,
): Promise<PackageActionState> {
  await prisma.package.update({
    where: { id },
    data: { isActive },
  });

  revalidatePackagePaths(id);
  return {};
}

export async function searchPackages(query?: string) {
  const q = query?.trim();

  return prisma.package.findMany({
    where: q
      ? { name: { contains: q, mode: "insensitive" } }
      : undefined,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { clients: true } },
    },
  });
}

export async function getPackageById(id: string) {
  return prisma.package.findUnique({
    where: { id },
    include: {
      _count: { select: { clients: true, projects: true } },
    },
  });
}
