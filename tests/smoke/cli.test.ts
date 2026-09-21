import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, "../..");
const cliPath = join(projectRoot, "dist", "index.js");

let temporaryHome: string;
let alternateCwd: string;

beforeAll(async () => {
  temporaryHome = await mkdtemp(join(tmpdir(), "cli-sdd-full-smoke-"));
  alternateCwd = join(temporaryHome, "elsewhere");
  await mkdir(alternateCwd);
});

afterAll(async () => {
  await rm(temporaryHome, { recursive: true });
});

async function runCli(args: string[], cwd = projectRoot) {
  try {
    const result = await execFileAsync(process.execPath, [cliPath, ...args], {
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

describe("compiled complete CLI", () => {
  it("lists every command in help", async () => {
    const result = await runCli(["--help"]);

    expect(result).toMatchObject({ exitCode: 0, stderr: "" });
    for (const command of ["add", "list", "status", "update", "delete"]) {
      expect(result.stdout).toContain(command);
    }
  });

  it("runs the complete persistent workflow from arbitrary directories", async () => {
    expect(
      await runCli(["add", "First", "--priority", "high", "--description", "Initial"]),
    ).toMatchObject({ exitCode: 0, stderr: "" });
    expect(await runCli(["add", "Second", "--priority", "low"], alternateCwd)).toMatchObject({
      exitCode: 0,
      stderr: "",
    });

    const initialList = await runCli(["list"]);
    expect(initialList.stdout.indexOf("Second")).toBeLessThan(initialList.stdout.indexOf("First"));

    expect(await runCli(["status", "1", "in-progress"])).toMatchObject({
      exitCode: 0,
      stderr: "",
    });
    expect(await runCli(["status", "1", "done"])).toMatchObject({ exitCode: 0, stderr: "" });
    expect(
      await runCli([
        "update",
        "2",
        "--title",
        "Second revised",
        "--description",
        "",
        "--priority",
        "medium",
      ]),
    ).toMatchObject({ exitCode: 0, stderr: "" });

    const done = await runCli(["list", "--status", "done"]);
    expect(done.stdout).toContain("First");
    expect(done.stdout).not.toContain("Second revised");

    expect(await runCli(["delete", "2", "--force"])).toMatchObject({
      exitCode: 0,
      stderr: "",
    });
    const finalList = await runCli(["list"]);
    expect(finalList.stdout).toContain("First");
    expect(finalList.stdout).not.toContain("Second revised");
  }, 30_000);

  it("returns actionable failures without stacks or data changes", async () => {
    await runCli(["add", "Blocked transition"]);
    const failed = await runCli(["status", "3", "done"]);

    expect(failed.exitCode).toBe(1);
    expect(failed.stdout).toBe("");
    expect(failed.stderr).toMatch(/in-progress first/i);
    expect(failed.stderr).not.toMatch(/\n\s+at /);

    const listed = await runCli(["list", "--status", "todo"]);
    expect(listed.stdout).toContain("Blocked transition");
  });
});
