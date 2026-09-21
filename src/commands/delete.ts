import type { Command } from "commander";

import type { Task } from "../db/generated/prisma/client.js";
import { ValidationError } from "../utils/errors.js";
import { parseTaskId } from "../utils/validation.js";

export interface DeleteCommandDependencies {
  getTaskById(id: number): Promise<Task>;
  deleteTask(id: number): Promise<Task>;
  confirmDelete(message: string, defaultValue: boolean): Promise<boolean>;
  isInteractive(): boolean;
  writeOut(message: string): void;
}

interface DeleteOptions {
  force?: boolean;
}

function isPromptCancellation(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "ExitPromptError" || error.name === "AbortPromptError")
  );
}

export function registerDeleteCommand(
  program: Command,
  dependencies: DeleteCommandDependencies,
): void {
  program
    .command("delete")
    .description("Delete a task")
    .argument("<id>", "task ID")
    .option("--force", "delete without confirmation")
    .action(async (idValue: string, options: DeleteOptions) => {
      const id = parseTaskId(idValue);
      const task = await dependencies.getTaskById(id);

      if (options.force !== true) {
        if (!dependencies.isInteractive()) {
          throw new ValidationError(
            "Confirmation requires an interactive terminal. Rerun with --force.",
          );
        }

        let confirmed: boolean;
        try {
          confirmed = await dependencies.confirmDelete(
            `Delete task ${task.id} "${task.title}"?`,
            false,
          );
        } catch (error) {
          if (!isPromptCancellation(error)) {
            throw error;
          }
          dependencies.writeOut(`Deletion cancelled. Task ${id} was not changed.\n`);
          return;
        }

        if (!confirmed) {
          dependencies.writeOut(`Deletion cancelled. Task ${id} was not changed.\n`);
          return;
        }
      }

      const deleted = await dependencies.deleteTask(id);
      dependencies.writeOut(`Deleted task ${deleted.id} "${deleted.title}".\n`);
    });
}
