---

description: "Implementation tasks for the personal task management CLI"
---

# Tasks: Personal Task Management CLI

**Input**: Design documents from `specs/001-manage-personal-tasks/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/commands.md`, `quickstart.md`

**Tests**: Vitest coverage is REQUIRED for all business logic by the project constitution.
Command and subprocess smoke tests are required for affected CLI flows.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested as
an independently valuable increment after the shared foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it uses different files and has no incomplete dependency.
- **[Story]**: Maps a task to a specification story (`US1`, `US2`, `US3`, or `US4`).
- Every task names the exact file or directory it changes.

## Path Conventions

- **Commands**: `src/commands/`
- **Database**: `src/db/`
- **Pure utilities**: `src/utils/`
- **Prisma assets**: `prisma/`, `prisma.config.ts`
- **Tests**: `tests/unit/`, `tests/commands/`, `tests/smoke/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the TypeScript ESM package, required dependencies, build, test, and Prisma
configuration without implementing user-story behavior.

- [ ] T001 Configure Node `>=22.13`, the `task` bin, package files, runtime/dev dependencies, pnpm scripts, and aligned Prisma versions in `package.json` and `pnpm-lock.yaml`
- [ ] T002 [P] Configure strict NodeNext development and production compilation in `tsconfig.json` and `tsconfig.build.json`
- [ ] T003 [P] Configure Vitest unit, command, and smoke test discovery in `vitest.config.ts`
- [ ] T004 [P] Configure Prisma 7 ESM generation, SQLite datasource, migration paths, and generated output under `src/db/generated/prisma/` in `prisma.config.ts` and `prisma/schema.prisma`

**Checkpoint**: Package installation, Prisma configuration, type checking, and empty test discovery
can run without implementing commands.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build persistence startup and shared error/validation behavior required by every
user story.

**CRITICAL**: No user story implementation begins until this phase is complete.

- [ ] T005 Add the Task table, defaults, and ordering/filter indexes in `prisma/migrations/0001_init/migration.sql`
- [ ] T006 Generate and verify the publishable Prisma ESM client in `src/db/generated/prisma/`
- [ ] T007 Implement home-directory resolution, recursive `~/.task-cli` creation, packaged `prisma migrate deploy`, and injectable test paths in `src/db/init.ts`
- [ ] T008 Implement the `PrismaBetterSqlite3` client factory and deterministic disconnect lifecycle in `src/db/client.ts`
- [ ] T009 [P] Define expected application errors and safe user-facing error mapping in `src/utils/errors.ts`
- [ ] T010 [P] Define canonical status/priority constants plus strict ID, title, enum, and partial-update parsers in `src/utils/validation.ts`
- [ ] T011 [P] Add Vitest coverage for valid and invalid shared parsers in `tests/unit/validation.test.ts`
- [ ] T012 Add isolated temporary-home tests for directory creation, first-run migration, repeat migration, and disconnect behavior in `tests/unit/db-init.test.ts`

**Checkpoint**: A temporary user home can initialize and reopen a migrated database; shared
validation and error behavior pass Vitest without touching the real user database.

---

## Phase 3: User Story 1 - Capture and Review Tasks (Priority: P1) MVP

**Goal**: Create tasks with defaults or optional details and list all tasks in a readable,
newest-first table.

**Independent Test**: Against an isolated database, create a title-only task and a fully
specified task, then list them and verify IDs, defaults, values, columns, and deterministic
ordering. Invalid titles and priorities create no row.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add create/list database tests for defaults, monotonic IDs, optional descriptions, ordering ties, and invalid no-write behavior in `tests/unit/tasks-create-list.test.ts`
- [ ] T014 [P] [US1] Add `task add` contract tests for successful and invalid inputs, stdout/stderr, and exit codes in `tests/commands/add.test.ts`
- [ ] T015 [P] [US1] Add unfiltered `task list` contract tests for table columns, wrapping, ordering, and empty-state output in `tests/commands/list.test.ts`
- [ ] T016 [P] [US1] Add pure table-formatting tests for full titles, dates, statuses, priorities, and no-color readability in `tests/unit/output.test.ts`

### Implementation for User Story 1

- [ ] T017 [US1] Implement create and unfiltered newest-first list queries in `src/db/tasks.ts`
- [ ] T018 [P] [US1] Implement readable `cli-table3` rows, wrapping, creation-date formatting, and empty-state messages in `src/utils/output.ts`
- [ ] T019 [US1] Implement the `add` command with title, description, priority, success output, and actionable errors in `src/commands/add.ts`
- [ ] T020 [US1] Implement the unfiltered `list` command and table output in `src/commands/list.ts`

**Checkpoint**: User Story 1 passes its unit and command tests and provides the minimum useful
task tracker independently of later stories.

---

## Phase 4: User Story 2 - Progress Work Through Its Lifecycle (Priority: P2)

**Goal**: Move tasks only through allowed lifecycle transitions and reject invalid, same-state,
or stale transitions without writes.

**Independent Test**: Seed a task directly in each status, exercise every allowed transition,
and verify that `todo -> done`, same-state, invalid, unknown-ID, and concurrent stale requests
fail without changing stored status.

### Tests for User Story 2

- [ ] T021 [P] [US2] Add exhaustive pure transition-matrix tests for allowed, prohibited, and same-state changes in `tests/unit/transitions.test.ts`
- [ ] T022 [P] [US2] Add `task status` contract tests for success, invalid transitions, unknown IDs, stale writes, messages, and exit codes in `tests/commands/status.test.ts`

### Implementation for User Story 2

- [ ] T023 [US2] Implement the pure status-transition matrix and corrective error details in `src/utils/transitions.ts`
- [ ] T024 [US2] Extend `src/db/tasks.ts` with task lookup and status updates conditional on the previously validated status to reject stale writes
- [ ] T025 [US2] Implement the `status` command with transition validation and previous/new status output in `src/commands/status.ts`

**Checkpoint**: User Story 2 passes its transition and command tests using seeded tasks without
requiring update or delete behavior.

---

## Phase 5: User Story 3 - Find and Correct Tasks (Priority: P3)

**Goal**: Filter tasks by status and priority and partially update title, description, or
priority while retaining omitted fields.

**Independent Test**: Seed mixed tasks, verify each filter and their AND combination, then update
each editable field independently and together, including description clearing and all invalid
update paths.

### Tests for User Story 3

- [ ] T026 [P] [US3] Add database tests for status/priority filters, combined filters, partial updates, retained fields, description clearing, and unknown IDs in `tests/unit/tasks-filter-update.test.ts`
- [ ] T027 [P] [US3] Add filtered `task list` contract tests for valid filters, invalid values, ordering, and no-match output in `tests/commands/list-filters.test.ts`
- [ ] T028 [P] [US3] Add `task update` contract tests for each field, combined fields, empty updates, validation errors, and exit codes in `tests/commands/update.test.ts`

### Implementation for User Story 3

- [ ] T029 [US3] Extend `src/db/tasks.ts` with AND-combined list filters and partial update queries that preserve omitted values
- [ ] T030 [US3] Extend `src/commands/list.ts` with validated `--status` and `--priority` options plus no-match output
- [ ] T031 [US3] Implement the `update` command with at-least-one-field validation and explicit empty-description clearing in `src/commands/update.ts`

**Checkpoint**: User Story 3 passes database and command tests and works with seeded tasks
without requiring deletion behavior.

---

## Phase 6: User Story 4 - Remove Unneeded Tasks Safely (Priority: P4)

**Goal**: Delete a task only after affirmative confirmation unless `--force` is supplied, while
preserving data on decline, interruption, invalid IDs, or non-interactive misuse.

**Independent Test**: Seed a task and verify decline, Ctrl+C-style interruption, approval,
`--force`, non-TTY without force, unknown ID, stdout/stderr, and exit codes.

### Tests for User Story 4

- [ ] T032 [P] [US4] Add database tests for task deletion, unknown IDs, and no-write failure paths in `tests/unit/tasks-delete.test.ts`
- [ ] T033 [P] [US4] Add `task delete` contract tests with injected confirmation for approve, decline, interruption, force bypass, non-TTY, and unknown-ID behavior in `tests/commands/delete.test.ts`

### Implementation for User Story 4

- [ ] T034 [US4] Extend `src/db/tasks.ts` with fetch-for-confirmation and single-task deletion queries in `src/db/tasks.ts`
- [ ] T035 [US4] Implement the `delete` command with Inquirer default-no confirmation, local cancellation handling, TTY checks, and force bypass in `src/commands/delete.ts`

**Checkpoint**: User Story 4 passes deletion tests and cannot remove data without a confirmed or
forced request.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Compose all independently tested commands into the shipped executable and validate
the complete package against constitutional gates.

- [ ] T036 Register all five command modules in `src/commands/index.ts` and implement the shebang, dependency composition, `parseAsync()`, top-level error boundary, exit codes, and guaranteed disconnect in `src/index.ts`
- [ ] T037 [P] Add compiled subprocess smoke coverage for help, version, full add/list/status/update/delete flow, failures without stacks, and temporary-home isolation in `tests/smoke/cli.test.ts`
- [ ] T038 [P] Add the 10,000-task time-to-first-stdout and ordering smoke test in `tests/smoke/list-performance.test.ts`
- [ ] T039 [P] Add packed-tarball and isolated global pnpm installation checks for the `task` bin, compiled Prisma client, config, schema, and migrations in `tests/smoke/package.test.ts`
- [ ] T040 [P] Document installation, command examples, database location, status transitions, and error conventions in `README.md`
- [ ] T041 Execute every scenario in `specs/001-manage-personal-tasks/quickstart.md` and correct any documentation discrepancy in `specs/001-manage-personal-tasks/quickstart.md`
- [ ] T042 Run the `package.json` typecheck, test, build, pack, and global-install scripts and resolve all failures in `package.json`, `src/`, `tests/`, `prisma/`, and `pnpm-lock.yaml`

**Checkpoint**: The packed package installs globally with pnpm, `task` works from any directory,
all tests pass, no expected failure leaks a stack, and all constitution gates remain satisfied.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T002, T003, and T004 may proceed in parallel after the
  intended package choices are known.
- **Foundational (Phase 2)**: Depends on Setup and blocks every user story.
- **User Stories (Phases 3-6)**: Depend on Foundational. They are functionally independently
  testable, but edits to `src/db/tasks.ts` mean US1-US4 should normally be integrated in priority
  order unless contributors coordinate that shared file.
- **Polish (Phase 7)**: Depends on all selected user stories.

### User Story Dependency Graph

```text
Setup -> Foundational -> US1 (P1) -> Polish
                      -> US2 (P2) -> Polish
                      -> US3 (P3) -> Polish
                      -> US4 (P4) -> Polish
```

- **US1**: No functional dependency on another story; establishes the MVP create/list workflow.
- **US2**: Uses the shared Task schema and seeded records; does not require US1 command behavior.
- **US3**: Uses the shared Task schema and seeded records; does not require US1 or US2 commands.
- **US4**: Uses the shared Task schema and seeded records; does not require earlier command flows.

### Within Each User Story

1. Add story tests against the documented interfaces.
2. Implement pure rules and database operations required by those tests.
3. Implement or extend command handlers.
4. Run all tests for the story before its checkpoint.

## Parallel Opportunities

- Setup configuration files T002-T004 are independent after T001 establishes package choices.
- Foundational error and validation work T009-T011 can proceed alongside database lifecycle work
  T007-T008 when shared signatures are agreed.
- Tests marked [P] within each story use separate files and can be authored concurrently.
- US1 output formatting T018 can proceed alongside database queries T017.
- US2-US4 can be developed by separate contributors after Foundational, but changes to
  `src/db/tasks.ts` must be serialized or coordinated.
- Final smoke, performance, package, and README tasks T037-T040 use separate files and can run in
  parallel after command composition T036.

## Parallel Examples

### User Story 1

```text
T013 tests/unit/tasks-create-list.test.ts
T014 tests/commands/add.test.ts
T015 tests/commands/list.test.ts
T016 tests/unit/output.test.ts
```

### User Story 2

```text
T021 tests/unit/transitions.test.ts
T022 tests/commands/status.test.ts
```

### User Story 3

```text
T026 tests/unit/tasks-filter-update.test.ts
T027 tests/commands/list-filters.test.ts
T028 tests/commands/update.test.ts
```

### User Story 4

```text
T032 tests/unit/tasks-delete.test.ts
T033 tests/commands/delete.test.ts
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1 only.
3. Run T013-T020 and demonstrate create/list against an isolated database.
4. Stop and validate the MVP before adding lifecycle, update/filter, or deletion behavior.

### Incremental Delivery

1. Deliver US1 for task capture and review.
2. Add US2 for controlled lifecycle transitions.
3. Add US3 for filtering and corrections.
4. Add US4 for safe deletion.
5. Complete Phase 7 to produce and validate the globally installable package.

## Notes

- All business-rule changes require corresponding Vitest coverage.
- Expected failures MUST use actionable messages and MUST NOT expose stack traces.
- Tests and development commands MUST use temporary homes and never touch
  `~/.task-cli/tasks.db`.
- Do not add repository, service, controller, logging, color, DI-container, or bundler layers
  unless a measured requirement first justifies a constitution exception.
