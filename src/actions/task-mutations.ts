"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TaskStatus } from "@/generated/prisma/client";
import type { TaskActionState } from "@/lib/tasks/action-state";
import {
  checklistTitlesAlreadyPresent,
  checklistTitlesToAdd,
} from "@/lib/tasks/website-build-checklist";
import { prisma } from "@/lib/prisma";
import { taskFormSchema, taskInputToDbFields } from "@/lib/validators/task";

function revalidateTaskPaths(taskId?: string, projectId?: string) {
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
  if (taskId) {
    revalidatePath(`/dashboard/tasks/${taskId}`);
    revalidatePath(`/dashboard/tasks/${taskId}/edit`);
  }
  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`);
  }
}

function formatZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): TaskActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors, error: issues[0]?.message ?? "Invalid input" };
}

function parseTaskFormData(formData: FormData) {
  return taskFormSchema.safeParse({
    title: formData.get("title"),
    projectId: formData.get("projectId"),
    description: formData.get("description") ?? undefined,
    status: formData.get("status") ?? "TODO",
    priority: formData.get("priority") ?? "MEDIUM",
    dueDate: formData.get("dueDate") ?? undefined,
  });
}

async function validateProjectExists(projectId: string): Promise<string | null> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return "Selected project not found";
  return null;
}

export async function createTaskAction(
  _prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const parsed = parseTaskFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const projectError = await validateProjectExists(parsed.data.projectId);
  if (projectError) {
    return { fieldErrors: { projectId: projectError } };
  }

  const task = await prisma.task.create({
    data: taskInputToDbFields(parsed.data),
  });

  revalidateTaskPaths(task.id, task.projectId);
  redirect(`/dashboard/tasks/${task.id}`);
}

export async function updateTaskAction(
  id: string,
  _prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Task not found" };
  }

  const parsed = parseTaskFormData(formData);
  if (!parsed.success) {
    return formatZodErrors(parsed.error.issues);
  }

  const projectError = await validateProjectExists(parsed.data.projectId);
  if (projectError) {
    return { fieldErrors: { projectId: projectError } };
  }

  const task = await prisma.task.update({
    where: { id },
    data: taskInputToDbFields(parsed.data),
  });

  revalidateTaskPaths(id, task.projectId);
  if (existing.projectId !== task.projectId) {
    revalidateTaskPaths(undefined, existing.projectId);
  }

  redirect(`/dashboard/tasks/${id}`);
}

export async function deleteTaskAction(
  id: string,
): Promise<TaskActionState> {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    return { error: "Task not found" };
  }

  await prisma.task.delete({ where: { id } });
  revalidateTaskPaths(undefined, task.projectId);
  return { success: true };
}

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus,
): Promise<TaskActionState> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return { error: "Task not found" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === "DONE" ? new Date() : null,
    },
  });

  revalidateTaskPaths(taskId, task.projectId);
  return { success: true };
}

export async function addWebsiteBuildChecklistAction(
  projectId: string,
): Promise<TaskActionState> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { tasks: { select: { title: true } } },
  });

  if (!project) {
    return { error: "Project not found" };
  }

  if (
    project.serviceType !== "WEBSITE_BUILD" &&
    project.serviceType !== "WEBSITE_REDESIGN"
  ) {
    return {
      error: "Website build checklist is only available for website projects.",
    };
  }

  const existingTitles = project.tasks.map((t) => t.title);

  if (checklistTitlesAlreadyPresent(existingTitles)) {
    return {
      error: "Website build checklist has already been added to this project.",
    };
  }

  const titlesToAdd = checklistTitlesToAdd(existingTitles);

  if (titlesToAdd.length === 0) {
    return { error: "All checklist tasks already exist on this project." };
  }

  await prisma.task.createMany({
    data: titlesToAdd.map((title) => ({
      title,
      projectId,
      status: "TODO",
      priority: "MEDIUM",
    })),
  });

  revalidateTaskPaths(undefined, projectId);
  return {
    success: true,
    createdCount: titlesToAdd.length,
    message: `Added ${titlesToAdd.length} checklist task${titlesToAdd.length === 1 ? "" : "s"}.`,
  };
}
