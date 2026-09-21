import type { Task } from "./generated/prisma/client.js";
import type { TaskPrismaClient } from "./client.js";
import { NotFoundError, OperationError } from "../utils/errors.js";
import { parsePriority, parseTitle } from "../utils/validation.js";
import type {
  ParsedUpdateFields,
  TaskPriority,
  TaskStatus,
} from "../utils/validation.js";

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: string;
}

export interface ListTaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
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

export async function listTasks(
  client: TaskPrismaClient,
  filters: ListTaskFilters = {},
): Promise<Task[]> {
  return client.task.findMany({
    where: {
      ...(filters.status === undefined ? {} : { status: filters.status }),
      ...(filters.priority === undefined ? {} : { priority: filters.priority }),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function getTaskById(client: TaskPrismaClient, id: number): Promise<Task> {
  const task = await client.task.findUnique({ where: { id } });
  if (task === null) {
    throw new NotFoundError(`Task ${id} was not found. Run "task list" to view available tasks.`);
  }

  return task;
}

export async function updateTaskStatus(
  client: TaskPrismaClient,
  id: number,
  expectedStatus: TaskStatus,
  requestedStatus: TaskStatus,
): Promise<Task> {
  const result = await client.task.updateMany({
    where: { id, status: expectedStatus },
    data: { status: requestedStatus },
  });

  if (result.count !== 1) {
    throw new OperationError(`Task ${id} changed before it could be updated. Retry the command.`);
  }

  return getTaskById(client, id);
}

export async function updateTask(
  client: TaskPrismaClient,
  id: number,
  fields: ParsedUpdateFields,
): Promise<Task> {
  await getTaskById(client, id);
  return client.task.update({ where: { id }, data: fields });
}

export async function deleteTask(client: TaskPrismaClient, id: number): Promise<Task> {
  const task = await getTaskById(client, id);
  const result = await client.task.deleteMany({ where: { id } });
  if (result.count !== 1) {
    throw new NotFoundError(`Task ${id} was not found. Run "task list" to view available tasks.`);
  }

  return task;
}
