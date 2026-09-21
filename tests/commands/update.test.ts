import { describe, expect, it, vi } from "vitest";

import { executeProgram } from "../../src/commands/index.js";
import { NotFoundError } from "../../src/utils/errors.js";
import { createTestDependencies, sampleTask } from "./helpers.js";

describe("task update", () => {
  it.each([
    [["--title", "  Revised  "], { title: "Revised" }],
    [["--description", "New details"], { description: "New details" }],
    [["--description", ""], { description: null }],
    [["--priority", "low"], { priority: "low" }],
  ] as const)("updates one field", async (options, expectedFields) => {
    const result = createTestDependencies({
      updateTask: vi.fn(async (_id, fields) => ({ ...sampleTask, ...fields })),
    });

    expect(await executeProgram(["node", "task", "update", "1", ...options], result.deps)).toBe(0);
    expect(result.deps.updateTask).toHaveBeenCalledWith(1, expectedFields);
    expect(result.stdout.join("")).toContain("Updated task 1");
  });

  it("updates multiple fields together", async () => {
    const result = createTestDependencies({
      updateTask: vi.fn(async (_id, fields) => ({ ...sampleTask, ...fields })),
    });

    expect(
      await executeProgram(
        ["node", "task", "update", "1", "--title", "Combined", "--priority", "high"],
        result.deps,
      ),
    ).toBe(0);
    expect(result.deps.updateTask).toHaveBeenCalledWith(1, {
      title: "Combined",
      priority: "high",
    });
  });

  it.each([
    [["node", "task", "update", "1"], /at least one/i],
    [["node", "task", "update", "1", "--title", "   "], /non-whitespace/i],
    [["node", "task", "update", "1", "--priority", "urgent"], /high, medium, or low/i],
    [["node", "task", "update", "zero", "--title", "Valid"], /positive integer/i],
  ] as const)("rejects invalid updates before writing", async (args, message) => {
    const result = createTestDependencies();

    expect(await executeProgram([...args], result.deps)).toBe(1);
    expect(result.deps.updateTask).not.toHaveBeenCalled();
    expect(result.stderr.join("")).toMatch(message);
  });

  it("reports unknown tasks", async () => {
    const result = createTestDependencies({
      updateTask: vi.fn(async () => {
        throw new NotFoundError('Task 99 was not found. Run "task list" to view available tasks.');
      }),
    });

    expect(
      await executeProgram(["node", "task", "update", "99", "--title", "Missing"], result.deps),
    ).toBe(1);
    expect(result.stderr.join("")).toMatch(/not found/i);
  });
});
