#!/usr/bin/env node

import { confirm } from "@inquirer/prompts";

import { executeProgram, type ProgramDependencies } from "./commands/index.js";
import { createPrismaClient, type TaskPrismaClient } from "./db/client.js";
import { initializeDatabase } from "./db/init.js";
import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
  updateTaskStatus,
} from "./db/tasks.js";

export async function run(argv: readonly string[] = process.argv): Promise<number> {
  let client: TaskPrismaClient | undefined;

  async function getClient(): Promise<TaskPrismaClient> {
    if (client === undefined) {
      const location = await initializeDatabase();
      client = createPrismaClient(location.databaseUrl);
    }
    return client;
  }

  const dependencies: ProgramDependencies = {
    createTask: async (input) => createTask(await getClient(), input),
    listTasks: async (filters) => listTasks(await getClient(), filters),
    getTaskById: async (id) => getTaskById(await getClient(), id),
    updateTaskStatus: async (id, expected, requested) =>
      updateTaskStatus(await getClient(), id, expected, requested),
    updateTask: async (id, fields) => updateTask(await getClient(), id, fields),
    deleteTask: async (id) => deleteTask(await getClient(), id),
    confirmDelete: async (message, defaultValue) => confirm({ message, default: defaultValue }),
    isInteractive: () => process.stdin.isTTY === true && process.stdout.isTTY === true,
    writeOut: (message) => process.stdout.write(message),
    writeErr: (message) => process.stderr.write(message),
  };

  let exitCode = await executeProgram(argv, dependencies);
  if (client !== undefined) {
    try {
      await client.$disconnect();
    } catch {
      dependencies.writeErr(
        "error: Database shutdown failed. Verify task storage permissions and retry.\n",
      );
      exitCode = 1;
    }
  }

  return exitCode;
}

void run()
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch(() => {
    process.stderr.write("error: Unexpected operation failure. Retry the command.\n");
    process.exitCode = 1;
  });
