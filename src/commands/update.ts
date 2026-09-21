import type { Command } from "commander";

import type { Task } from "../db/generated/prisma/client.js";
import { parseTaskId, parseUpdateFields, type ParsedUpdateFields } from "../utils/validation.js";

export interface UpdateCommandDependencies {
  updateTask(id: number, fields: ParsedUpdateFields): Promise<Task>;
  writeOut(message: string): void;
}

interface UpdateOptions {
  title?: string;
  description?: string;
  priority?: string;
}

export function registerUpdateCommand(
  program: Command,
  dependencies: UpdateCommandDependencies,
): void {
  program
    .command("update")
    .description("Update task details")
    .argument("<id>", "task ID")
    .option("--title <text>", "replacement title")
    .option("--description <text>", "replacement description; empty clears it")
    .option("--priority <priority>", "high, medium, or low")
    .action(async (idValue: string, options: UpdateOptions) => {
      const id = parseTaskId(idValue);
      const fields = parseUpdateFields(options);
      const task = await dependencies.updateTask(id, fields);
      dependencies.writeOut(
        `Updated task ${task.id} "${task.title}" (priority: ${task.priority}, description: ${task.description ?? "none"}).\n`,
      );
    });
}
