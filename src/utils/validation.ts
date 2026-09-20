import { ValidationError } from "./errors.js";

export const taskStatuses = ["todo", "in-progress", "done"] as const;
export const taskPriorities = ["high", "medium", "low"] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];

export interface UpdateFieldInput {
  title?: string;
  description?: string;
  priority?: string;
}

export interface ParsedUpdateFields {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
}

export function parseTaskId(value: string): number {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new ValidationError(`Task ID "${value}" is invalid. Use a positive integer.`);
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    throw new ValidationError(`Task ID "${value}" is invalid. Use a positive integer.`);
  }

  return id;
}

export function parseTitle(value: string): string {
  const title = value.trim();
  if (title.length === 0) {
    throw new ValidationError("Title is invalid. Provide at least one non-whitespace character.");
  }

  return title;
}

export function parsePriority(value: string | undefined): TaskPriority {
  if (value === undefined) {
    return "medium";
  }

  if (!taskPriorities.includes(value as TaskPriority)) {
    throw new ValidationError(`Priority "${value}" is invalid. Use high, medium, or low.`);
  }

  return value as TaskPriority;
}

export function parseStatus(value: string): TaskStatus {
  if (!taskStatuses.includes(value as TaskStatus)) {
    throw new ValidationError(`Status "${value}" is invalid. Use todo, in-progress, or done.`);
  }

  return value as TaskStatus;
}

export function parseUpdateFields(input: UpdateFieldInput): ParsedUpdateFields {
  if (input.title === undefined && input.description === undefined && input.priority === undefined) {
    throw new ValidationError(
      "No editable fields were supplied. Provide at least one of title, description, or priority.",
    );
  }

  const parsed: ParsedUpdateFields = {};
  if (input.title !== undefined) {
    parsed.title = parseTitle(input.title);
  }
  if (input.description !== undefined) {
    parsed.description = input.description === "" ? null : input.description;
  }
  if (input.priority !== undefined) {
    parsed.priority = parsePriority(input.priority);
  }

  return parsed;
}
