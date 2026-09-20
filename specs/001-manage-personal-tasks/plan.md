# Implementation Plan: Personal Task Management CLI

**Branch**: `main` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-manage-personal-tasks/spec.md`

## Summary

Build the globally installable `task` executable for creating, listing, progressing, updating,
and deleting personal tasks. Implement it as a TypeScript ESM CLI using Commander.js and
Inquirer, with Prisma ORM and a local SQLite database at `~/.task-cli/tasks.db`. Keep command
handlers thin, database operations in `src/db/`, and reusable validation, transition, error,
and output functions in `src/utils/`.

## Technical Context

**Language/Version**: TypeScript 7.0.2 on Node.js 24 LTS; package engine floor
`>=22.13` for current Commander and Inquirer compatibility

**Primary Dependencies**: Commander.js 15, `@inquirer/prompts` 8, Prisma ORM 7 with the Prisma
CLI retained at runtime, `@prisma/adapter-libsql`, and `cli-table3`;
Prisma package versions MUST be pinned together

**Storage**: SQLite via Prisma at `~/.task-cli/tasks.db`; committed Prisma migrations are
packaged and applied before opening the client

**Testing**: Vitest unit tests for validation and state transitions; command tests with injected
dependencies; subprocess smoke tests against the compiled executable and a temporary `HOME`;
GitHub Actions jobs on `ubuntu-24.04` and `macos-15`

**Target Platform**: Linux and macOS environments supported by Node.js LTS and the SQLite
adapter; globally installed with pnpm and invoked as `task`; Windows is not guaranteed initially

**Project Type**: Single TypeScript CLI package using ESM

**Performance Goals**: Filtered and unfiltered lists of up to 10,000 tasks begin displaying rows
within 2 seconds on a GitHub-hosted `ubuntu-24.04` runner using Node.js 24; remaining rows may
continue rendering

**Constraints**: Offline operation; one local user; no stack traces; exit code 0 for success or
cancelled deletion and 1 for errors; database path independent of the working directory; no
production database in the repository; deletion confirmation defaults to no

**Scale/Scope**: One Task entity, one local database, five subcommands, and up to 10,000 tasks;
no users, network services, synchronization, web API, due dates, subtasks, tags, or categories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate

- **Toolchain — PASS**: TypeScript, Node.js LTS, pnpm, ESM, and `tsx` are fixed choices.
- **CLI contract — PASS**: Commander parses commands; Inquirer handles deletion confirmation;
  tables, errors, cancellation, and exit codes are specified.
- **Persistence — PASS**: Prisma uses SQLite at `~/.task-cli/tasks.db`; initialization creates
  the parent directory and applies committed migrations.
- **Structure — PASS**: The design uses only `commands/`, `db/`, and `utils/` for authored
  application modules, plus the entry point and Prisma-generated database code.
- **Tests — PASS**: Vitest covers business rules and command failures; subprocess smoke tests
  cover the compiled executable.
- **Dependencies — PASS**: Each runtime dependency directly provides mandated CLI, prompt,
  table, ORM, migration, or SQLite functionality. No logging, color, DI, or build framework is
  added.
- **Distribution — PASS**: `package.json` exposes `task` from compiled output and package smoke
  tests validate global installation.

### Post-Design Re-check

- **PASS**: `research.md` resolves all technical choices without weakening a principle.
- **PASS**: `data-model.md` uses the required local Task model and explicit transition rules.
- **PASS**: `contracts/commands.md` preserves readable output, actionable errors, and exit 0/1.
- **PASS**: `quickstart.md` validates build, isolated persistence, command behavior, tests, and
  global package installation.

## Project Structure

### Documentation (this feature)

```text
specs/001-manage-personal-tasks/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── commands.md
└── tasks.md                 # Created by /speckit.tasks, not by this plan
```

### Source Code (repository root)

```text
.github/
└── workflows/
    └── ci.yml

prisma/
├── schema.prisma
└── migrations/

src/
├── commands/
│   ├── add.ts
│   ├── delete.ts
│   ├── index.ts
│   ├── list.ts
│   ├── status.ts
│   └── update.ts
├── db/
│   ├── client.ts
│   ├── init.ts
│   ├── tasks.ts
│   └── generated/prisma/
├── utils/
│   ├── errors.ts
│   ├── output.ts
│   ├── transitions.ts
│   └── validation.ts
└── index.ts

tests/
├── unit/
├── commands/
└── smoke/
    ├── cli-mvp.test.ts
    ├── cli.test.ts
    ├── list-performance.test.ts
    └── package.test.ts

package.json
prisma.config.ts
tsconfig.json
tsconfig.build.json
vitest.config.ts
```

**Structure Decision**: Use a single flat CLI package. Each file in `commands/` registers one
subcommand and delegates directly to injected database functions and pure utilities. `db/`
owns path resolution, migration startup, Prisma construction, and task queries. `utils/` owns
framework-independent rules and terminal formatting. No repository, service, controller, or
dependency-injection layers are introduced.

## Complexity Tracking

No constitution violations or justified exceptions are required.
