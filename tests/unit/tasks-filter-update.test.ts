import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createPrismaClient, type TaskPrismaClient } from "../../src/db/client.js";
import { initializeDatabase } from "../../src/db/init.js";
import { createTask, listTasks, updateTask } from "../../src/db/tasks.js";

let client: TaskPrismaClient;
let temporaryHome: string;

beforeAll(async () => {
  temporaryHome = await mkdtemp(join(tmpdir(), "cli-sdd-filter-update-"));
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

describe("list filters", () => {
  it("filters by status, priority, and their AND combination", async () => {
    const highTodo = await createTask(client, { title: "High todo", priority: "high" });
    const lowTodo = await createTask(client, { title: "Low todo", priority: "low" });
    const highDone = await createTask(client, { title: "High done", priority: "high" });
    await client.task.update({ where: { id: highDone.id }, data: { status: "done" } });

    expect((await listTasks(client, { status: "todo" })).map((task) => task.id)).toEqual([
      lowTodo.id,
      highTodo.id,
    ]);
    expect((await listTasks(client, { priority: "high" })).map((task) => task.id)).toEqual([
      highDone.id,
      highTodo.id,
    ]);
    expect(
      (await listTasks(client, { status: "todo", priority: "high" })).map((task) => task.id),
    ).toEqual([highTodo.id]);
  });
});

describe("updateTask", () => {
  it("updates supplied fields and retains omitted values", async () => {
    const task = await createTask(client, {
      title: "Original",
      description: "Keep or clear",
      priority: "high",
    });

    const titleOnly = await updateTask(client, task.id, { title: "Revised" });
    expect(titleOnly).toMatchObject({
      title: "Revised",
      description: "Keep or clear",
      priority: "high",
    });

    const combined = await updateTask(client, task.id, { description: null, priority: "low" });
    expect(combined).toMatchObject({ title: "Revised", description: null, priority: "low" });
  });

  it("rejects unknown IDs without creating data", async () => {
    await expect(updateTask(client, 999, { title: "Missing" })).rejects.toThrow(/not found/i);
    await expect(client.task.count()).resolves.toBe(0);
  });
});
