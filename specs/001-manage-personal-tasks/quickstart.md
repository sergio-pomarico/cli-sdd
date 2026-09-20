# Quickstart: Validate Personal Task Management

This guide validates the implemented feature end to end. It intentionally uses a temporary home
directory so validation cannot modify `~/.task-cli/tasks.db`.

## Prerequisites

- A supported Node.js LTS release (`node --version`), preferably Node.js 24
- pnpm 11 (`pnpm --version`)
- A POSIX-compatible shell for the examples; use an equivalent temporary directory and `HOME`
  override on Windows

## Install and Build

```bash
pnpm install
pnpm build
pnpm test
```

Expected: TypeScript compilation, Prisma client generation, and all Vitest suites succeed.

## Use an Isolated Database

```bash
export CLI_SDD_TEST_HOME="$(mktemp -d)"
export HOME="$CLI_SDD_TEST_HOME"
node dist/index.js --help
```

Expected: help lists `add`, `list`, `status`, `update`, and `delete`. The first data command
creates `$HOME/.task-cli/tasks.db` and applies packaged migrations.

## Validate Core Workflow

```bash
node dist/index.js add "Write project plan"
node dist/index.js add "Review migration" --priority high --description "Check SQLite schema"
node dist/index.js list
node dist/index.js status 1 in-progress
node dist/index.js status 1 done
node dist/index.js update 2 --priority low --description ""
node dist/index.js list --status done
node dist/index.js list --priority low
```

Expected:

- IDs increase from 1.
- New tasks start in `todo`; omitted priority is `medium`.
- List output has ID, Title, Status, Priority, and Created columns in newest-first order.
- Valid transitions and partial updates persist between invocations.
- Status and priority filters return only matching rows.

## Validate Failure Paths

```bash
node dist/index.js add "Invalid priority" --priority urgent
node dist/index.js status 2 done
node dist/index.js update 999 --title "Missing"
node dist/index.js delete 999 --force
```

Expected: each command exits 1, writes an actionable error to stderr, prints no stack trace, and
does not change stored tasks. Task 2 cannot move directly from `todo` to `done`.

## Validate Deletion

```bash
node dist/index.js delete 2
node dist/index.js list
node dist/index.js delete 2 --force
node dist/index.js list
```

Expected: declining or interrupting the first prompt preserves task 2 and exits 0. The forced
command performs no prompt, deletes task 2, and exits 0.

## Validate Global Package

```bash
pnpm pack
pnpm add -g ./cli-sdd-1.0.0.tgz
task --help
task list
```

Expected: the `task` executable works from the current directory without project-specific setup.
The packed artifact includes compiled Prisma client code, `prisma.config.ts`,
`prisma/schema.prisma`, and all committed migrations.

## Validate Performance

Run the smoke test that seeds 10,000 tasks in an isolated database and measures elapsed time
until the first stdout data from a filtered list:

```bash
pnpm vitest run tests/smoke/list-performance.test.ts
```

Expected: the first rows appear within 2 seconds on a typical personal computer; remaining rows
may continue rendering and maintain the contracted ordering. If migration checks dominate
time-to-first-row, optimize the check described in [research.md](./research.md) without bypassing
Prisma migration ownership.

## Cleanup

```bash
rm -rf "$CLI_SDD_TEST_HOME"
```

See [commands.md](./contracts/commands.md) for the full CLI contract and
[data-model.md](./data-model.md) for persistence and transition rules.
