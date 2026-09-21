import { vi } from "vitest";

import type { ProgramDependencies } from "../../src/commands/index.js";

export const sampleTask = {
  id: 1,
  title: "Sample task",
  description: null,
  status: "todo",
  priority: "medium",
  createdAt: new Date("2026-09-20T12:00:00.000Z"),
};

export function createTestDependencies(overrides: Partial<ProgramDependencies> = {}) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const deps: ProgramDependencies = {
    createTask: vi.fn(async (input) => ({
      ...sampleTask,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? "medium",
    })),
    listTasks: vi.fn(async () => []),
    getTaskById: vi.fn(async () => sampleTask),
    updateTaskStatus: vi.fn(async (_id, _expected, status) => ({ ...sampleTask, status })),
    updateTask: vi.fn(async (_id, fields) => ({ ...sampleTask, ...fields })),
    deleteTask: vi.fn(async () => sampleTask),
    confirmDelete: vi.fn(async () => false),
    isInteractive: () => true,
    writeOut: (message) => stdout.push(message),
    writeErr: (message) => stderr.push(message),
    ...overrides,
  };

  return { deps, stdout, stderr };
}
