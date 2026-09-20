import { Command, CommanderError } from "commander";

import type { CreateTaskInput } from "../db/tasks.js";
import type { Task } from "../db/generated/prisma/client.js";
import { toErrorMessage } from "../utils/errors.js";
import { registerAddCommand } from "./add.js";
import { registerListCommand } from "./list.js";

export interface ProgramDependencies {
  createTask(input: CreateTaskInput): Promise<Task>;
  listTasks(): Promise<Task[]>;
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
