import { describe, expect, it, vi } from "vitest";

import { executeProgram, type ProgramDependencies } from "../../src/commands/index.js";
import { createTestDependencies } from "./helpers.js";

function dependencies(tasks: Awaited<ReturnType<ProgramDependencies["listTasks"]>>) {
  const result = createTestDependencies({
    listTasks: vi.fn(async () => tasks),
  });

  return { ...result.deps, stdout: result.stdout, stderr: result.stderr };
}

describe("task list", () => {
  it("renders all required columns and keeps repository order", async () => {
    const deps = dependencies([
      {
        id: 2,
        title: "New task",
        description: null,
        status: "todo",
        priority: "high",
        createdAt: new Date(2026, 8, 20, 14, 5),
      },
      {
        id: 1,
        title: "Old task",
        description: null,
        status: "todo",
        priority: "medium",
        createdAt: new Date(2026, 8, 19, 9, 3),
      },
    ]);

    const exitCode = await executeProgram(["node", "task", "list"], deps);
    const output = deps.stdout.join("");

    expect(exitCode).toBe(0);
    expect(output).toMatch(/ID.*Title.*Status.*Priority.*Created/s);
    expect(output.indexOf("New task")).toBeLessThan(output.indexOf("Old task"));
    expect(output).toContain("2026-09-20 14:05");
    expect(deps.stderr).toEqual([]);
  });

  it("prints a clear empty state", async () => {
    const deps = dependencies([]);

    expect(await executeProgram(["node", "task", "list"], deps)).toBe(0);
    expect(deps.stdout.join("")).toBe("No tasks found.\n");
  });

  it("wraps long titles without losing content", async () => {
    const title = "A very long title that must wrap across multiple terminal table lines";
    const deps = dependencies([
      {
        id: 1,
        title,
        description: null,
        status: "todo",
        priority: "low",
        createdAt: new Date(2026, 8, 20, 14, 5),
      },
    ]);

    await executeProgram(["node", "task", "list"], deps);

    const output = deps.stdout.join("");
    expect(output).toContain("A very long title that must wrap across");
    expect(output).toContain("multiple terminal table lines");
  });
});
