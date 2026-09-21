import { describe, expect, it, vi } from "vitest";

import { executeProgram } from "../../src/commands/index.js";
import { createTestDependencies, sampleTask } from "./helpers.js";

describe("task list filters", () => {
  it("passes validated status and priority filters together", async () => {
    const result = createTestDependencies({
      listTasks: vi.fn(async () => [{ ...sampleTask, priority: "high" }]),
    });

    expect(
      await executeProgram(
        ["node", "task", "list", "--status", "todo", "--priority", "high"],
        result.deps,
      ),
    ).toBe(0);
    expect(result.deps.listTasks).toHaveBeenCalledWith({ status: "todo", priority: "high" });
    expect(result.stdout.join("")).toContain("Sample task");
  });

  it.each([
    [["node", "task", "list", "--status", "blocked"], /todo, in-progress, or done/i],
    [["node", "task", "list", "--priority", "urgent"], /high, medium, or low/i],
  ] as const)("rejects invalid filters before querying", async (args, message) => {
    const result = createTestDependencies();

    expect(await executeProgram([...args], result.deps)).toBe(1);
    expect(result.deps.listTasks).not.toHaveBeenCalled();
    expect(result.stderr.join("")).toMatch(message);
  });

  it("prints a no-match message for an empty filtered result", async () => {
    const result = createTestDependencies();

    expect(
      await executeProgram(["node", "task", "list", "--status", "done"], result.deps),
    ).toBe(0);
    expect(result.stdout.join("")).toBe("No tasks match the selected filters.\n");
  });
});
