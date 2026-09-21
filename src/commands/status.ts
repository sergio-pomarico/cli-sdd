import type { Command } from "commander";

import type { Task } from "../db/generated/prisma/client.js";
import { assertStatusTransition } from "../utils/transitions.js";
import { parseStatus, parseTaskId, type TaskStatus } from "../utils/validation.js";

export interface StatusCommandDependencies {
  getTaskById(id: number): Promise<Task>;
  updateTaskStatus(id: number, expected: TaskStatus, requested: TaskStatus): Promise<Task>;
  writeOut(message: string): void;
}

export function registerStatusCommand(
  program: Command,
  dependencies: StatusCommandDependencies,
): void {
  program
    .command("status")
    .description("Change a task status")
    .argument("<id>", "task ID")
    .argument("<status>", "todo, in-progress, or done")
    .action(async (idValue: string, statusValue: string) => {
      const id = parseTaskId(idValue);
      const requestedStatus = parseStatus(statusValue);
      const task = await dependencies.getTaskById(id);
      const currentStatus = parseStatus(task.status);

      assertStatusTransition(currentStatus, requestedStatus);
      await dependencies.updateTaskStatus(id, currentStatus, requestedStatus);
      dependencies.writeOut(`Task ${id} moved from ${currentStatus} to ${requestedStatus}.\n`);
    });
}
