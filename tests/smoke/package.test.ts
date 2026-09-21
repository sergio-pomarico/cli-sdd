import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { promisify } from "node:util";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, "../..");

let temporaryRoot: string;
let tarballPath: string;
let globalBin: string;
let dataHome: string;

beforeAll(async () => {
  temporaryRoot = await mkdtemp(join(tmpdir(), "cli-sdd-package-"));
  globalBin = join(temporaryRoot, "bin");
  dataHome = join(temporaryRoot, "home");
  await Promise.all([
    mkdir(globalBin),
    mkdir(dataHome),
    mkdir(join(temporaryRoot, "global")),
    mkdir(join(temporaryRoot, "cwd")),
  ]);

  await execFileAsync("pnpm", ["pack", "--pack-destination", temporaryRoot], {
    cwd: projectRoot,
  });
  tarballPath = join(temporaryRoot, "cli-sdd-1.0.0.tgz");
});

afterAll(async () => {
  await rm(temporaryRoot, { recursive: true });
});

describe("packed global CLI", () => {
  it("contains the executable and Prisma assets without a development database", async () => {
    const { stdout } = await execFileAsync("tar", ["-tf", tarballPath]);

    expect(stdout).toContain("package/dist/index.js");
    expect(stdout).toContain("package/dist/db/generated/prisma/client.js");
    expect(stdout).toContain("package/prisma.config.ts");
    expect(stdout).toContain("package/prisma/schema.prisma");
    expect(stdout).toMatch(/package\/prisma\/migrations\/.*\/migration\.sql/);
    expect(stdout).not.toContain("prisma/dev.db");
  });

  it("installs globally and runs from an unrelated directory", async () => {
    const environment = {
      ...process.env,
      PATH: `${globalBin}${delimiter}${process.env["PATH"] ?? ""}`,
      PNPM_HOME: globalBin,
    };
    try {
      await execFileAsync(
        "pnpm",
        [
          "add",
          "--global",
          "--global-dir",
          join(temporaryRoot, "global"),
          "--global-bin-dir",
          globalBin,
          tarballPath,
        ],
        { cwd: projectRoot, env: environment },
      );
    } catch (error) {
      const failure = error as Error & { stdout?: string; stderr?: string };
      throw new Error(`${failure.message}\n${failure.stdout ?? ""}\n${failure.stderr ?? ""}`);
    }

    const executable = join(globalBin, "task");
    const cwd = join(temporaryRoot, "cwd");
    const commandEnvironment = { ...environment, HOME: dataHome };
    const help = await execFileAsync(executable, ["--help"], { cwd, env: commandEnvironment });
    const added = await execFileAsync(executable, ["add", "Packed task"], {
      cwd,
      env: commandEnvironment,
    });
    const listed = await execFileAsync(executable, ["list"], { cwd, env: commandEnvironment });

    expect(help.stdout).toContain("delete");
    expect(added.stdout).toContain("Packed task");
    expect(listed.stdout).toContain("Packed task");
  }, 90_000);
});
