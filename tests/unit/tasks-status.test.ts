import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createPrismaClient, type TaskPrismaClient } from "../../src/db/client.js";
import { initializeDatabase } from "../../src/db/init.js";
import { createTask, getTaskById, updateTaskStatus } from "../../src/db/tasks.js";

let client: TaskPrismaClient;
let temporaryHome: string;

beforeAll(async () => {
  temporaryHome = await mkdtemp(join(tmpdir(), "cli-sdd-status-"));
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

describe("status persistence", () => {
  it("looks up and conditionally updates a task", async () => {
    const task = await createTask(client, { title: "Progress me" });

    await expect(getTaskById(client, task.id)).resolves.toMatchObject({ status: "todo" });
    await expect(updateTaskStatus(client, task.id, "todo", "in-progress")).resolves.toMatchObject({
      status: "in-progress",
    });
  });

  it("rejects unknown lookups and stale writes", async () => {
    await expect(getTaskById(client, 999)).rejects.toThrow(/not found/i);
    const task = await createTask(client, { title: "Concurrent task" });
    await client.task.update({ where: { id: task.id }, data: { status: "in-progress" } });

    await expect(updateTaskStatus(client, task.id, "todo", "in-progress")).rejects.toThrow(
      /changed.*retry/i,
    );
    await expect(getTaskById(client, task.id)).resolves.toMatchObject({ status: "in-progress" });
  });
});
