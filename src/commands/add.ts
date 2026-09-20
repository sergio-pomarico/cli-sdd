import type { Command } from "commander";

import type { CreateTaskInput } from "../db/tasks.js";
import type { Task } from "../db/generated/prisma/client.js";
import { parsePriority, parseTitle } from "../utils/validation.js";

export interface AddCommandDependencies {
  createTask(input: CreateTaskInput): Promise<Task>;
  writeOut(message: string): void;
}

interface AddOptions {
  description?: string;
  priority?: string;
}

export function registerAddCommand(
  program: Command,
  dependencies: AddCommandDependencies,
): void {
  program
    .command("add")
    .description("Create a task")
    .argument("<title>", "task title")
    .option("--priority <priority>", "high, medium, or low")
    .option("--description <text>", "task description")
    .action(async (title: string, options: AddOptions) => {
      const input: CreateTaskInput = {
        title: parseTitle(title),
        priority: parsePriority(options.priority),
      };
      if (options.description !== undefined) {
        input.description = options.description;
      }

      const task = await dependencies.createTask(input);
      dependencies.writeOut(
        `Created task ${task.id} "${task.title}" (${task.status}, ${task.priority}).\n`,
      );
    });
}
