#!/usr/bin/env node

import { executeProgram, type ProgramDependencies } from "./commands/index.js";
import { createPrismaClient, type TaskPrismaClient } from "./db/client.js";
import { initializeDatabase } from "./db/init.js";
import { createTask, listTasks } from "./db/tasks.js";

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
    listTasks: async () => listTasks(await getClient()),
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

process.exitCode = await run();
