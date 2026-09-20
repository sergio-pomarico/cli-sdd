import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { createRequire } from "node:module";

import { OperationError } from "../utils/errors.js";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);

export interface InitializeDatabaseOptions {
  homeDir?: string;
  packageRoot?: string;
}

export interface DatabaseLocation {
  databasePath: string;
  databaseUrl: string;
}

function defaultPackageRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../..");
}

export async function initializeDatabase(
  options: InitializeDatabaseOptions = {},
): Promise<DatabaseLocation> {
  const dataDirectory = join(options.homeDir ?? homedir(), ".task-cli");
  const databasePath = join(dataDirectory, "tasks.db");
  const databaseUrl = pathToFileURL(databasePath).href;
  const packageRoot = options.packageRoot ?? defaultPackageRoot();

  await mkdir(dataDirectory, { recursive: true });

  try {
    const prismaCli = require.resolve("prisma/build/index.js");
    await execFileAsync(
      process.execPath,
      [prismaCli, "migrate", "deploy", "--config", join(packageRoot, "prisma.config.ts")],
      {
        cwd: packageRoot,
        env: { ...process.env, DATABASE_URL: databaseUrl },
      },
    );
  } catch {
    throw new OperationError(
      "Database initialization failed. Verify the task data directory is writable and retry.",
    );
  }

  return { databasePath, databaseUrl };
}
