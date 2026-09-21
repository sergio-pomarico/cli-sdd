import { Command, CommanderError } from "commander";

import type { Task } from "../db/generated/prisma/client.js";
import type { CreateTaskInput, ListTaskFilters } from "../db/tasks.js";
import { toErrorMessage } from "../utils/errors.js";
import type { ParsedUpdateFields, TaskStatus } from "../utils/validation.js";
import { registerAddCommand } from "./add.js";
import { registerDeleteCommand } from "./delete.js";
import { registerListCommand } from "./list.js";
import { registerStatusCommand } from "./status.js";
import { registerUpdateCommand } from "./update.js";

export interface ProgramDependencies {
  createTask(input: CreateTaskInput): Promise<Task>;
  listTasks(filters?: ListTaskFilters): Promise<Task[]>;
  getTaskById(id: number): Promise<Task>;
  updateTaskStatus(id: number, expected: TaskStatus, requested: TaskStatus): Promise<Task>;
  updateTask(id: number, fields: ParsedUpdateFields): Promise<Task>;
  deleteTask(id: number): Promise<Task>;
  confirmDelete(message: string, defaultValue: boolean): Promise<boolean>;
  isInteractive(): boolean;
  writeOut(message: string): void;
  writeErr(message: string): void;
}

export function createProgram(dependencies: ProgramDependencies): Command {
  const program = new Command()
    .name("task")
    .description("Manage personal tasks")
    .version("1.0.0")
    .showSuggestionAfterError()
    .exitOverride()
    .configureOutput({
      writeOut: dependencies.writeOut,
      writeErr: dependencies.writeErr,
    });

  registerAddCommand(program, dependencies);
  registerListCommand(program, dependencies);
  registerStatusCommand(program, dependencies);
  registerUpdateCommand(program, dependencies);
  registerDeleteCommand(program, dependencies);

  return program;
}

export async function executeProgram(
  argv: readonly string[],
  dependencies: ProgramDependencies,
): Promise<number> {
  try {
    await createProgram(dependencies).parseAsync([...argv]);
    return 0;
  } catch (error) {
    if (error instanceof CommanderError) {
      return error.exitCode === 0 ? 0 : 1;
    }

    dependencies.writeErr(`error: ${toErrorMessage(error)}\n`);
    return 1;
  }
}
