import type { Command } from "commander";

import type { Task } from "../db/generated/prisma/client.js";
import { formatTaskTable } from "../utils/output.js";

export interface ListCommandDependencies {
  listTasks(): Promise<Task[]>;
  writeOut(message: string): void;
}

export function registerListCommand(
  program: Command,
  dependencies: ListCommandDependencies,
): void {
  program
    .command("list")
    .description("List tasks in newest-first order")
    .action(async () => {
      const tasks = await dependencies.listTasks();
      dependencies.writeOut(`${formatTaskTable(tasks)}\n`);
    });
}
