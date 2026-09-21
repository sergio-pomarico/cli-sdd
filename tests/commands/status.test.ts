import { describe, expect, it, vi } from "vitest";

import { executeProgram, type ProgramDependencies } from "../../src/commands/index.js";
import { NotFoundError, OperationError } from "../../src/utils/errors.js";
import { createTestDependencies } from "./helpers.js";

const task = {
  id: 7,
  title: "Lifecycle task",
  description: null,
  status: "todo",
  priority: "medium",
  createdAt: new Date("2026-09-20T12:00:00.000Z"),
};

function dependencies(overrides: Partial<ProgramDependencies> = {}) {
  return createTestDependencies({
    getTaskById: vi.fn(async () => task),
    updateTaskStatus: vi.fn(async (_id, _expected, status) => ({ ...task, status })),
    ...overrides,
  });
}

describe("task status", () => {
  it("updates an allowed transition and reports previous and new status", async () => {
    const { deps, stdout, stderr } = dependencies();

    expect(await executeProgram(["node", "task", "status", "7", "in-progress"], deps)).toBe(0);
    expect(deps.updateTaskStatus).toHaveBeenCalledWith(7, "todo", "in-progress");
    expect(stdout.join("")).toContain("Task 7 moved from todo to in-progress.");
    expect(stderr).toEqual([]);
  });

  it("rejects direct todo -> done and same-state requests without writing", async () => {
    for (const requested of ["done", "todo"]) {
      const { deps, stderr } = dependencies();

      expect(await executeProgram(["node", "task", "status", "7", requested], deps)).toBe(1);
      expect(deps.updateTaskStatus).not.toHaveBeenCalled();
      expect(stderr.join("")).toMatch(requested === "done" ? /in-progress first/i : /already todo/i);
    }
  });

  it("reports unknown IDs without writing", async () => {
    const { deps, stderr } = dependencies({
      getTaskById: vi.fn(async () => {
        throw new NotFoundError('Task 99 was not found. Run "task list" to view available tasks.');
      }),
    });

    expect(await executeProgram(["node", "task", "status", "99", "in-progress"], deps)).toBe(1);
    expect(deps.updateTaskStatus).not.toHaveBeenCalled();
    expect(stderr.join("")).toMatch(/Task 99 was not found/i);
  });

  it("reports stale conditional writes", async () => {
    const { deps, stderr } = dependencies({
      updateTaskStatus: vi.fn(async () => {
        throw new OperationError("Task 7 changed before it could be updated. Retry the command.");
      }),
    });

    expect(await executeProgram(["node", "task", "status", "7", "in-progress"], deps)).toBe(1);
    expect(stderr.join("")).toMatch(/changed.*retry/i);
  });

  it.each([
    [["node", "task", "status", "zero", "in-progress"], /positive integer/i],
    [["node", "task", "status", "7", "blocked"], /todo, in-progress, or done/i],
  ] as const)("rejects invalid input before lookup", async (args, message) => {
    const { deps, stderr } = dependencies();

    expect(await executeProgram([...args], deps)).toBe(1);
    expect(deps.getTaskById).not.toHaveBeenCalled();
    expect(stderr.join("")).toMatch(message);
  });
});
