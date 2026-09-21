import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createPrismaClient } from "../../src/db/client.js";
import { initializeDatabase } from "../../src/db/init.js";

const temporaryHomes: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryHomes.splice(0).map((directory) => rm(directory, { recursive: true })));
});

describe("initializeDatabase", () => {
  it("creates the home directory, deploys migrations, and can repeat safely", async () => {
    const homeDir = await mkdtemp(join(tmpdir(), "cli-sdd-home-"));
    temporaryHomes.push(homeDir);

    const first = await initializeDatabase({ homeDir });

    expect(first.databasePath).toBe(join(homeDir, ".task-cli", "tasks.db"));
    expect(existsSync(first.databasePath)).toBe(true);

    const firstClient = createPrismaClient(first.databaseUrl);
    await expect(firstClient.task.count()).resolves.toBe(0);
    await firstClient.$disconnect();

    const second = await initializeDatabase({ homeDir });
    expect(second).toEqual(first);

    const secondClient = createPrismaClient(second.databaseUrl);
    await expect(secondClient.task.count()).resolves.toBe(0);
    await secondClient.$disconnect();
  }, 30_000);

  it("maps data-directory creation failures to an actionable storage error", async () => {
    const temporaryRoot = await mkdtemp(join(tmpdir(), "cli-sdd-invalid-home-"));
    temporaryHomes.push(temporaryRoot);
    const invalidHome = join(temporaryRoot, "home-file");
    await writeFile(invalidHome, "not a directory");

    await expect(initializeDatabase({ homeDir: invalidHome })).rejects.toThrow(
      /database initialization failed.*writable/i,
    );
  });
});
