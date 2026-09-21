import { ValidationError } from "./errors.js";
import type { TaskStatus } from "./validation.js";

const allowedTransitions: Readonly<Record<TaskStatus, readonly TaskStatus[]>> = {
  todo: ["in-progress"],
  "in-progress": ["done", "todo"],
  done: ["todo"],
};

export function assertStatusTransition(current: TaskStatus, requested: TaskStatus): void {
  if (current === requested) {
    throw new ValidationError(
      `Task is already ${current}. Choose a different valid destination status.`,
    );
  }

  if (allowedTransitions[current].includes(requested)) {
    return;
  }

  if (current === "todo" && requested === "done") {
    throw new ValidationError(
      "Cannot move a task directly from todo to done. Move it to in-progress first.",
    );
  }

  throw new ValidationError(
    `Cannot move a task from ${current} to ${requested}. Move it to ${allowedTransitions[current].join(" or ")} next.`,
  );
}
