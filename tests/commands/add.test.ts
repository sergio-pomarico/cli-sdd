import { describe, expect, it, vi } from "vitest";

import { executeProgram, type ProgramDependencies } from "../../src/commands/index.js";

function dependencies(): ProgramDependencies & {
  stdout: string[];
  stderr: string[];
} {
  const stdout: string[] = [];
  const stderr: string[] = [];

  return {
    stdout,
    stderr,
    createTask: vi.fn(async (input) => ({
      id: 7,
      title: input.title,
      description: input.description ?? null,
      status: "todo",
      priority: input.priority ?? "medium",
      createdAt: new Date("2026-09-20T12:00:00.000Z"),
    })),
    listTasks: vi.fn(async () => []),
    writeOut: (message) => stdout.push(message),
    writeErr: (message) => stderr.push(message),
  };
}

describe("task add", () => {
  it("creates a title-only task and reports defaults", async () => {
    const deps = dependencies();
    const exitCode = await executeProgram(["node", "task", "add", "  Write tests  "], deps);

    expect(exitCode).toBe(0);
    expect(deps.createTask).toHaveBeenCalledWith({
      title: "Write tests",
      priority: "medium",
    });
    expect(deps.stdout.join("")).toContain('Created task 7 "Write tests" (todo, medium).');
    expect(deps.stderr).toEqual([]);
  });

  it("passes optional priority and description", async () => {
    const deps = dependencies();
    const exitCode = await executeProgram(
      ["node", "task", "add", "Ship MVP", "--priority", "high", "--description", "Today"],
      deps,
    );

    expect(exitCode).toBe(0);
    expect(deps.createTask).toHaveBeenCalledWith({
      title: "Ship MVP",
      priority: "high",
      description: "Today",
    });
  });

  it.each([
    [["node", "task", "add", "   "], /non-whitespace/i],
    [["node", "task", "add", "Task", "--priority", "urgent"], /high, medium, or low/i],
  ] as const)("rejects invalid input without writing", async (args, expectedMessage) => {
    const deps = dependencies();
    const exitCode = await executeProgram([...args], deps);

    expect(exitCode).toBe(1);
    expect(deps.createTask).not.toHaveBeenCalled();
    expect(deps.stderr.join("")).toMatch(expectedMessage);
    expect(deps.stderr.join("")).not.toMatch(/\n\s+at /);
  });

  it("reports a missing required title as a parser error", async () => {
    const deps = dependencies();

    expect(await executeProgram(["node", "task", "add"], deps)).toBe(1);
    expect(deps.createTask).not.toHaveBeenCalled();
    expect(deps.stderr.join("")).toMatch(/missing required argument.*title/i);
    expect(deps.stderr.join("")).not.toMatch(/\n\s+at /);
  });
});
