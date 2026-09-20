import { PrismaLibSql } from "@prisma/adapter-libsql";

import { PrismaClient } from "./generated/prisma/client.js";

export function createPrismaClient(databaseUrl: string): PrismaClient {
  const adapter = new PrismaLibSql({ url: databaseUrl });
  return new PrismaClient({ adapter });
}

export type TaskPrismaClient = ReturnType<typeof createPrismaClient>;
