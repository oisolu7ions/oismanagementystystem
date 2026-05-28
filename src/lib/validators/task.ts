import { z } from "zod";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";
import {
  TASK_PRIORITY_VALUES,
  TASK_STATUS_VALUES,
} from "@/lib/tasks/constants";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  projectId: z.string().trim().min(1, "Project is required"),
  description: optionalString,
  status: z.enum(TASK_STATUS_VALUES, { message: "Status is required" }),
  priority: z.enum(TASK_PRIORITY_VALUES, { message: "Priority is required" }),
  dueDate: optionalString,
});

export type TaskFormInput = z.infer<typeof taskFormSchema>;

export function parseTaskDueDate(value?: string): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function taskInputToDbFields(input: TaskFormInput) {
  const status = input.status as TaskStatus;
  const dueDate = parseTaskDueDate(input.dueDate);

  return {
    title: input.title,
    projectId: input.projectId,
    description: input.description ?? null,
    status,
    priority: input.priority as TaskPriority,
    dueDate,
    completedAt: status === "DONE" ? new Date() : null,
  };
}
