import type { Command } from "commander";

import type { Task } from "../db/generated/prisma/client.js";
import type { ListTaskFilters } from "../db/tasks.js";
import { formatTaskTable } from "../utils/output.js";
import { parsePriority, parseStatus } from "../utils/validation.js";

export interface ListCommandDependencies {
  listTasks(filters?: ListTaskFilters): Promise<Task[]>;
  writeOut(message: string): void;
}

interface ListOptions {
  status?: string;
  priority?: string;
}

const outputBatchSize = 100;

export function registerListCommand(
  program: Command,
  dependencies: ListCommandDependencies,
): void {
  program
    .command("list")
    .description("List tasks in newest-first order")
    .option("--status <status>", "todo, in-progress, or done")
    .option("--priority <priority>", "high, medium, or low")
    .action(async (options: ListOptions) => {
      const filters: ListTaskFilters = {};
      if (options.status !== undefined) {
        filters.status = parseStatus(options.status);
      }
      if (options.priority !== undefined) {
        filters.priority = parsePriority(options.priority);
      }

      const tasks = await dependencies.listTasks(filters);
      if (tasks.length === 0 && Object.keys(filters).length > 0) {
        dependencies.writeOut("No tasks match the selected filters.\n");
        return;
      }

      for (let index = 0; index < tasks.length; index += outputBatchSize) {
        dependencies.writeOut(`${formatTaskTable(tasks.slice(index, index + outputBatchSize))}\n`);
      }
      if (tasks.length === 0) {
        dependencies.writeOut(`${formatTaskTable(tasks)}\n`);
      }
    });
}
