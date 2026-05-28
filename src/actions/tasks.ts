import type { Prisma, TaskPriority, TaskStatus } from "@/generated/prisma/client";
import { endOfNext7Days, startOfToday } from "@/lib/dashboard/dates";
import { prisma } from "@/lib/prisma";
import { isTaskOverdue, type TaskStatusValue } from "@/lib/tasks/constants";

export type TaskSearchParams = {
  q?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  clientId?: string;
  overdue?: string;
  dueSoon?: string;
};

const taskListInclude = {
  project: {
    select: {
      id: true,
      name: true,
      client: {
        select: { id: true, name: true, businessName: true },
      },
    },
  },
} satisfies Prisma.TaskInclude;

function buildTaskWhere(params: TaskSearchParams): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {};
  const q = params.q?.trim();

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { project: { name: { contains: q, mode: "insensitive" } } },
      { project: { client: { name: { contains: q, mode: "insensitive" } } } },
      {
        project: {
          client: { businessName: { contains: q, mode: "insensitive" } },
        },
      },
    ];
  }

  if (params.status) {
    where.status = params.status as TaskStatus;
  }

  if (params.priority) {
    where.priority = params.priority as TaskPriority;
  }

  if (params.projectId) {
    where.projectId = params.projectId;
  }

  if (params.clientId) {
    where.project = { clientId: params.clientId };
  }

  const todayStart = startOfToday();
  const sevenDaysEnd = endOfNext7Days();

  if (params.overdue === "1") {
    where.status = { not: "DONE" };
    where.dueDate = { lt: todayStart };
  } else if (params.dueSoon === "1") {
    where.status = { not: "DONE" };
    where.dueDate = { gte: todayStart, lte: sevenDaysEnd };
  }

  return where;
}

export async function searchTasks(params: TaskSearchParams = {}) {
  return prisma.task.findMany({
    where: buildTaskWhere(params),
    include: taskListInclude,
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: { select: { id: true, name: true, businessName: true } },
        },
      },
    },
  });
}

export async function getTasksByProjectId(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { title: "asc" }],
  });
}

export async function getProjectsForTaskForm() {
  return prisma.project.findMany({
    orderBy: [{ client: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      client: { select: { id: true, name: true, businessName: true } },
    },
  });
}

export async function getProjectsForTaskFilter() {
  return getProjectsForTaskForm();
}

export async function getClientsForTaskFilter() {
  return prisma.client.findMany({
    where: { projects: { some: {} } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, businessName: true },
  });
}

export async function getDashboardTaskStats() {
  const todayStart = startOfToday();
  const sevenDaysEnd = endOfNext7Days();

  const [overdue, dueSoon] = await Promise.all([
    prisma.task.count({
      where: {
        status: { not: "DONE" },
        dueDate: { lt: todayStart },
      },
    }),
    prisma.task.count({
      where: {
        status: { not: "DONE" },
        dueDate: { gte: todayStart, lte: sevenDaysEnd },
      },
    }),
  ]);

  return { overdue, dueSoon };
}

export function taskIsOverdue(
  dueDate: Date | null,
  status: TaskStatusValue | string,
) {
  return isTaskOverdue(dueDate, status);
}
