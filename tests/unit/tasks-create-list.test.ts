import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createPrismaClient, type TaskPrismaClient } from "../../src/db/client.js";
import { initializeDatabase } from "../../src/db/init.js";
import { createTask, listTasks } from "../../src/db/tasks.js";

let client: TaskPrismaClient;
let temporaryHome: string;

beforeAll(async () => {
  temporaryHome = await mkdtemp(join(tmpdir(), "cli-sdd-tasks-"));
  const location = await initializeDatabase({ homeDir: temporaryHome });
  client = createPrismaClient(location.databaseUrl);
});

beforeEach(async () => {
  await client.task.deleteMany();
});

afterAll(async () => {
  await client.$disconnect();
  await rm(temporaryHome, { recursive: true });
});

describe("createTask and listTasks", () => {
  it("applies defaults and preserves optional values", async () => {
    const defaultTask = await createTask(client, { title: "  First task  " });
    const detailedTask = await createTask(client, {
      title: "Detailed task",
      description: "Useful context",
      priority: "high",
    });

    expect(defaultTask).toMatchObject({
      title: "First task",
      description: null,
      status: "todo",
      priority: "medium",
    });
    expect(detailedTask).toMatchObject({
      description: "Useful context",
      status: "todo",
      priority: "high",
    });
  });

  it("keeps IDs increasing after deletion", async () => {
    const first = await createTask(client, { title: "Disposable" });
    await client.task.delete({ where: { id: first.id } });
    const second = await createTask(client, { title: "Replacement" });

    expect(second.id).toBeGreaterThan(first.id);
  });

  it("orders newest first and uses descending ID for equal timestamps", async () => {
    const tiedTime = new Date("2026-09-20T12:00:00.000Z");
    const older = await client.task.create({ data: { title: "Older", createdAt: tiedTime } });
    const newer = await client.task.create({ data: { title: "Newer", createdAt: tiedTime } });

    const tasks = await listTasks(client);

    expect(tasks.map((task) => task.id)).toEqual([newer.id, older.id]);
  });

  it("does not write invalid task data", async () => {
    await expect(createTask(client, { title: "   " })).rejects.toThrow(/non-whitespace/i);
    await expect(createTask(client, { title: "Invalid", priority: "urgent" })).rejects.toThrow(
      /high, medium, or low/i,
    );
    await expect(client.task.count()).resolves.toBe(0);
  });
});
