# Research: Personal Task Management CLI

## Runtime and TypeScript Build

**Decision**: Target Node.js 24 LTS with an engine floor of `>=22.13`, pin TypeScript 7.0.2, use
TypeScript ESM and `tsx` for development, and compile with `tsc` for distribution.

**Rationale**: Current Commander and Inquirer releases require a modern Node.js runtime. Native
ESM plus `tsc` keeps production output inspectable and avoids a bundler that would complicate
Prisma assets and native SQLite dependencies. The `task` binary maps to `dist/index.js`, whose
source begins with `#!/usr/bin/env node`.

**Alternatives considered**:

- Shipping TypeScript through `tsx`: rejected because a global production command should not
  depend on a development loader.
- Adding tsup or esbuild: rejected until measured startup or distribution needs justify a
  bundler.
- Using a floating TypeScript range: rejected because an exact compiler version makes local and
  CI builds reproducible.

## Prisma and Local SQLite

**Decision**: Use aligned Prisma ORM 7 packages with `@prisma/adapter-libsql`. Generate the ESM
client into `src/db/generated/prisma`, derive the runtime URL from the user's home directory, and
create `~/.task-cli` recursively before connecting.

**Rationale**: Prisma 7 requires a driver adapter, and an explicit generated-client path works
with ESM compilation and package publication. Resolving the database from the home directory
makes behavior independent of `process.cwd()` and keeps production data outside the repository.

**Alternatives considered**:

- `@prisma/adapter-better-sqlite3`: rejected because its transitive native install script is
  blocked by default during clean pnpm global installs and a published dependency cannot approve
  that script on the user's behalf.
- Repository-relative SQLite: rejected because commands may run from any directory and the
  constitution fixes the user-home path.
- Remote SQLite or libSQL: rejected because synchronization and external services are out of
  scope.

## Schema Initialization and Upgrades

**Decision**: Commit and publish Prisma migrations, keep the Prisma CLI as a runtime dependency,
generate the initial migration with `prisma migrate dev --name init`, review and commit its SQL,
and run packaged `prisma migrate deploy` with an explicit config and `DATABASE_URL` before
constructing Prisma Client.

**Rationale**: This gives first-run initialization and safe future upgrades using Prisma's
migration ledger. The command resolves package assets from `import.meta.url`, never from PATH or
the current directory. The runtime dependency is justified because schema deployment is a
product requirement for globally installed users.

**Alternatives considered**:

- `prisma db push`: rejected because it has no reviewed migration history.
- A custom SQL migration runner: rejected because it would duplicate ordering, transaction,
  checksum, and recovery behavior.
- `postinstall` migration: rejected because install scripts may be disabled and installation
  must not unexpectedly mutate user data.

**Risk**: Running migration checks on every invocation may affect the 2-second time-to-first-row
target. Measure it in smoke tests; optimize only if needed by checking Prisma's migration ledger
before spawning deploy, without changing migration ownership.

## CLI Composition and Error Boundary

**Decision**: Build a fresh Commander `Command` in a `createProgram(dependencies)` function,
register async handlers, and call `parseAsync()`. Use one top-level boundary that maps expected
application errors and unexpected failures to concise stderr messages and exit code 1 without
printing stacks.

**Rationale**: Per-instance command trees and dependency injection make parsing and handlers
testable without global process mutation. Commander documents `parseAsync()` for promise-returning
actions and supports output interception for command tests.

**Alternatives considered**:

- Calling `process.exit()` inside handlers: rejected because it prevents cleanup and makes tests
  brittle.
- Calling Commander error APIs from business functions: rejected because it couples domain
  rules to the CLI framework.

## Interactive Deletion

**Decision**: Use the modular `confirm` prompt from `@inquirer/prompts` with `default: false`.
Skip prompt construction entirely for `--force`, catch prompt cancellation locally, and treat a
decline or interruption as a successful no-change result.

**Rationale**: Inquirer rejects its promise on Ctrl+C; catching that rejection prevents an
unhandled stack trace and matches the specification's exit code 0 for cancelled deletion. A
non-interactive terminal without `--force` returns an actionable exit-code-1 error.

**Alternatives considered**:

- Exit code 130 on Ctrl+C: rejected because it conflicts with the accepted no-change contract.
- A process-wide uncaught-exception handler: rejected because it could hide unrelated defects.

## Output and Colors

**Decision**: Render list output with `cli-table3` through a pure formatter. Show full values,
allow table wrapping, and add no general-purpose color dependency; if ANSI color is used, limit
it to status and priority while retaining readable text without color.

**Rationale**: `cli-table3` is the constitution-approved dependency and provides stable table
control. Avoiding a separate color package follows dependency restraint.

**Alternatives considered**:

- `console.table`: rejected because formatting varies across Node.js versions.
- Truncating titles: rejected because the contract requires showing the title; wrapping preserves
  information.

## Testing and Distribution

**Decision**: Test pure validation and transition logic with Vitest, test commands with injected
database/prompt/output dependencies, and run compiled subprocess smoke tests with a temporary
`HOME`. Build in `prepack`, publish compiled output plus `prisma.config.ts`, Prisma schema, and
migrations, and test a packed global installation by invoking `task --help`. Run the test and
package checks on GitHub-hosted `ubuntu-24.04` and `macos-15` runners using Node.js 24; use the
Ubuntu job as the authoritative environment for the 2-second time-to-first-row benchmark.

**Rationale**: This separates fast business-rule tests from process and packaging verification,
protects the real user database, and detects missing binary permissions or package assets.
The two-platform matrix verifies the native compiler and SQLite adapter on every guaranteed
initial platform without making variable local hardware part of the performance contract.

**Alternatives considered**:

- In-memory SQLite for migration tests: rejected because migration deployment runs in a separate
  process and cannot share the same in-memory connection.
- Source-only smoke tests: rejected because they cannot detect broken package contents.

## Primary References

- [Prisma configuration](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Prisma migrations in production](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate)
- [Commander.js README](https://github.com/tj/commander.js/blob/master/Readme.md)
- [Inquirer prompts README](https://github.com/SBoudrias/Inquirer.js/blob/main/packages/prompts/README.md)
- [npm package `bin` and `files`](https://docs.npmjs.com/cli/v11/configuring-npm/package-json)
