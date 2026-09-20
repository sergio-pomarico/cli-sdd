import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, "../..");
const cliPath = join(projectRoot, "dist", "index.js");

let temporaryHome: string;
let alternateCwd: string;
let linkedCliPath: string;

beforeAll(async () => {
  temporaryHome = await mkdtemp(join(tmpdir(), "cli-sdd-smoke-"));
  alternateCwd = join(temporaryHome, "another-directory");
  linkedCliPath = join(temporaryHome, "linked-task.js");
  await mkdir(alternateCwd);
  await symlink(cliPath, linkedCliPath);
});

afterAll(async () => {
  await rm(temporaryHome, { recursive: true });
});

async function runCli(args: string[], cwd = projectRoot, entrypoint = cliPath) {
  try {
    const result = await execFileAsync(process.execPath, [entrypoint, ...args], {
      cwd,
      env: { ...process.env, HOME: temporaryHome },
    });
    return { exitCode: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const failure = error as Error & { code?: number; stdout?: string; stderr?: string };
    return {
      exitCode: typeof failure.code === "number" ? failure.code : -1,
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? failure.message,
    };
  }
}

describe("compiled add/list MVP", () => {
  it("shows help and version without initializing task storage", async () => {
    const help = await runCli(["--help"]);
    const version = await runCli(["--version"], projectRoot, linkedCliPath);

    expect(help).toMatchObject({ exitCode: 0, stderr: "" });
    expect(help.stdout).toContain("add");
    expect(help.stdout).toContain("list");
    expect(version).toMatchObject({ exitCode: 0, stdout: "1.0.0\n", stderr: "" });
    expect(existsSync(join(temporaryHome, ".task-cli"))).toBe(false);
  });

  it("creates and lists persistent tasks from different working directories", async () => {
    const added = await runCli([
      "add",
      "Ship MVP",
      "--priority",
      "high",
      "--description",
      "Smoke tested",
    ]);
    const listed = await runCli(["list"], alternateCwd);

    expect(added).toMatchObject({ exitCode: 0, stderr: "" });
    expect(added.stdout).toContain('Created task 1 "Ship MVP" (todo, high).');
    expect(listed).toMatchObject({ exitCode: 0, stderr: "" });
    expect(listed.stdout).toContain("Ship MVP");
    expect(listed.stdout).toContain("Created");
    expect(existsSync(join(temporaryHome, ".task-cli", "tasks.db"))).toBe(true);
  });

  it("returns an actionable error without a stack trace", async () => {
    const result = await runCli(["add", "   "]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/error:.*non-whitespace/i);
    expect(result.stderr).not.toMatch(/\n\s+at /);
  });
});
