import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createPrismaClient, type TaskPrismaClient } from "../../src/db/client.js";
import { initializeDatabase } from "../../src/db/init.js";
import { createTask, deleteTask, getTaskById } from "../../src/db/tasks.js";

let client: TaskPrismaClient;
let temporaryHome: string;

beforeAll(async () => {
  temporaryHome = await mkdtemp(join(tmpdir(), "cli-sdd-delete-"));
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

describe("deleteTask", () => {
  it("deletes exactly the selected task", async () => {
    const selected = await createTask(client, { title: "Delete me" });
    const retained = await createTask(client, { title: "Keep me" });

    await expect(deleteTask(client, selected.id)).resolves.toEqual(selected);
    await expect(getTaskById(client, selected.id)).rejects.toThrow(/not found/i);
    await expect(getTaskById(client, retained.id)).resolves.toMatchObject({ title: "Keep me" });
  });

  it("rejects unknown IDs without deleting another task", async () => {
    const retained = await createTask(client, { title: "Keep me" });

    await expect(deleteTask(client, 999)).rejects.toThrow(/not found/i);
    await expect(getTaskById(client, retained.id)).resolves.toMatchObject({ title: "Keep me" });
  });
});
