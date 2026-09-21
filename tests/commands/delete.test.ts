import { describe, expect, it, vi } from "vitest";

import { executeProgram } from "../../src/commands/index.js";
import { NotFoundError } from "../../src/utils/errors.js";
import { createTestDependencies, sampleTask } from "./helpers.js";

describe("task delete", () => {
  it("deletes after affirmative confirmation", async () => {
    const result = createTestDependencies({ confirmDelete: vi.fn(async () => true) });

    expect(await executeProgram(["node", "task", "delete", "1"], result.deps)).toBe(0);
    expect(result.deps.confirmDelete).toHaveBeenCalledWith('Delete task 1 "Sample task"?', false);
    expect(result.deps.deleteTask).toHaveBeenCalledWith(1);
    expect(result.stdout.join("")).toContain('Deleted task 1 "Sample task".');
  });

  it("preserves the task when confirmation is declined", async () => {
    const result = createTestDependencies({ confirmDelete: vi.fn(async () => false) });

    expect(await executeProgram(["node", "task", "delete", "1"], result.deps)).toBe(0);
    expect(result.deps.deleteTask).not.toHaveBeenCalled();
    expect(result.stdout.join("")).toMatch(/cancelled.*not changed/i);
  });

  it("treats prompt interruption as successful cancellation", async () => {
    const promptError = new Error("cancelled");
    promptError.name = "ExitPromptError";
    const result = createTestDependencies({
      confirmDelete: vi.fn(async () => Promise.reject(promptError)),
    });

    expect(await executeProgram(["node", "task", "delete", "1"], result.deps)).toBe(0);
    expect(result.deps.deleteTask).not.toHaveBeenCalled();
    expect(result.stdout.join("")).toMatch(/cancelled.*not changed/i);
    expect(result.stderr).toEqual([]);
  });

  it("force bypasses prompt creation and TTY checks", async () => {
    const result = createTestDependencies({
      confirmDelete: vi.fn(async () => {
        throw new Error("must not run");
      }),
      isInteractive: () => false,
    });

    expect(await executeProgram(["node", "task", "delete", "1", "--force"], result.deps)).toBe(
      0,
    );
    expect(result.deps.confirmDelete).not.toHaveBeenCalled();
    expect(result.deps.deleteTask).toHaveBeenCalledWith(1);
  });

  it("rejects non-interactive deletion without force", async () => {
    const result = createTestDependencies({ isInteractive: () => false });

    expect(await executeProgram(["node", "task", "delete", "1"], result.deps)).toBe(1);
    expect(result.deps.confirmDelete).not.toHaveBeenCalled();
    expect(result.deps.deleteTask).not.toHaveBeenCalled();
    expect(result.stderr.join("")).toMatch(/interactive terminal.*--force/i);
  });

  it("reports unknown and invalid IDs before prompting", async () => {
    const unknown = createTestDependencies({
      getTaskById: vi.fn(async () => {
        throw new NotFoundError('Task 99 was not found. Run "task list" to view available tasks.');
      }),
    });
    expect(await executeProgram(["node", "task", "delete", "99", "--force"], unknown.deps)).toBe(
      1,
    );
    expect(unknown.deps.deleteTask).not.toHaveBeenCalled();

    const invalid = createTestDependencies();
    expect(await executeProgram(["node", "task", "delete", "zero", "--force"], invalid.deps)).toBe(
      1,
    );
    expect(invalid.deps.getTaskById).not.toHaveBeenCalled();
  });

  it("does not hide unexpected prompt failures", async () => {
    const result = createTestDependencies({
      confirmDelete: vi.fn(async () => Promise.reject(new Error("terminal failed"))),
    });

    expect(await executeProgram(["node", "task", "delete", "1"], result.deps)).toBe(1);
    expect(result.deps.deleteTask).not.toHaveBeenCalled();
    expect(result.stderr.join("")).toMatch(/unexpected operation failure/i);
  });
});
