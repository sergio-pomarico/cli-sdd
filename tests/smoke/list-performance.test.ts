import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { performance } from "node:perf_hooks";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createPrismaClient } from "../../src/db/client.js";
import { initializeDatabase } from "../../src/db/init.js";

const projectRoot = resolve(import.meta.dirname, "../..");
const cliPath = join(projectRoot, "dist", "index.js");

let temporaryHome: string;

beforeAll(async () => {
  temporaryHome = await mkdtemp(join(tmpdir(), "cli-sdd-performance-"));
  const location = await initializeDatabase({ homeDir: temporaryHome });
  const client = createPrismaClient(location.databaseUrl);
  const baseTime = Date.UTC(2026, 0, 1);

  await client.task.createMany({
    data: Array.from({ length: 10_000 }, (_, index) => {
      const sequence = index + 1;
      return {
        title: `Task ${String(sequence).padStart(5, "0")}`,
        status: sequence % 2 === 0 ? "done" : "todo",
        priority: sequence % 3 === 0 ? "high" : "medium",
        createdAt: new Date(baseTime + sequence * 1_000),
      };
    }),
  });
  await client.$disconnect();
}, 60_000);

afterAll(async () => {
  await rm(temporaryHome, { recursive: true });
});

describe("10,000-task list performance", () => {
  it("emits ordered filtered rows within the reference threshold", async () => {
    const startedAt = performance.now();
    let firstStdoutAt: number | undefined;
    let stdout = "";
    let stderr = "";

    const exitCode = await new Promise<number | null>((resolveExit, reject) => {
      const child = spawn(process.execPath, [cliPath, "list"], {
        cwd: projectRoot,
        env: { ...process.env, HOME: temporaryHome },
      });

      child.stdout.on("data", (chunk: Buffer) => {
        firstStdoutAt ??= performance.now();
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      child.on("error", reject);
      child.on("close", resolveExit);
    });

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    expect(firstStdoutAt).toBeDefined();
    expect(stdout.indexOf("Task 10000")).toBeLessThan(stdout.indexOf("Task 00001"));

    if (process.env["PERFORMANCE_REFERENCE"] === "1") {
      expect(firstStdoutAt! - startedAt).toBeLessThan(2_000);
    }
  }, 60_000);
});
