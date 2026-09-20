import type { Task } from "./generated/prisma/client.js";
import type { TaskPrismaClient } from "./client.js";
import { parsePriority, parseTitle } from "../utils/validation.js";

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: string;
}

export async function createTask(
  client: TaskPrismaClient,
  input: CreateTaskInput,
): Promise<Task> {
  const data: { title: string; description?: string; priority: string } = {
    title: parseTitle(input.title),
    priority: parsePriority(input.priority),
  };
  if (input.description !== undefined) {
    data.description = input.description;
  }

  return client.task.create({ data });
}

export async function listTasks(client: TaskPrismaClient): Promise<Task[]> {
  return client.task.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}
