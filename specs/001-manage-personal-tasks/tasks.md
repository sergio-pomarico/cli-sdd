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

- [X] T001 Configure Node `>=22.13`, exact TypeScript `7.0.2`, the `task` bin, package files, runtime/dev dependencies, pnpm scripts, and aligned Prisma versions in `package.json` and `pnpm-lock.yaml`
- [X] T002 [P] Configure strict NodeNext development and production compilation in `tsconfig.json` and `tsconfig.build.json`
- [X] T003 [P] Configure Vitest unit, command, and smoke test discovery in `vitest.config.ts`
- [X] T004 [P] Configure Prisma 7 ESM generation, SQLite datasource, migration paths, and generated output under `src/db/generated/prisma/` in `prisma.config.ts` and `prisma/schema.prisma`

**Checkpoint**: Package installation, Prisma configuration, type checking, and empty test discovery
can run without implementing commands.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build persistence startup and shared error/validation behavior required by every
user story.

**CRITICAL**: No user story implementation begins until this phase is complete.

- [X] T005 Run `pnpm prisma migrate dev --name init`, then review and retain the generated Task table, defaults, and ordering/filter indexes in `prisma/migrations/`
- [X] T006 Generate and verify the publishable Prisma ESM client in `src/db/generated/prisma/`
- [X] T007 Implement home-directory resolution, recursive `~/.task-cli` creation, packaged `prisma migrate deploy`, and injectable test paths in `src/db/init.ts`
- [X] T008 Implement the `PrismaLibSql` client factory and deterministic disconnect lifecycle in `src/db/client.ts`
- [X] T009 [P] Define expected application errors and safe user-facing error mapping in `src/utils/errors.ts`
- [X] T010 [P] Define canonical status/priority constants plus strict ID, title, enum, and partial-update parsers in `src/utils/validation.ts`
- [X] T011 [P] Add Vitest coverage for valid and invalid shared parsers in `tests/unit/validation.test.ts`
- [X] T012 Add isolated temporary-home tests for directory creation, first-run migration, repeat migration, and disconnect behavior in `tests/unit/db-init.test.ts`

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

- [X] T013 [P] [US1] Add create/list database tests for defaults, monotonic IDs, optional descriptions, ordering ties, and invalid no-write behavior in `tests/unit/tasks-create-list.test.ts`
- [X] T014 [P] [US1] Add `task add` contract tests for successful and invalid inputs, stdout/stderr, and exit codes in `tests/commands/add.test.ts`
- [X] T015 [P] [US1] Add unfiltered `task list` contract tests for table columns, wrapping, ordering, and empty-state output in `tests/commands/list.test.ts`
- [X] T016 [P] [US1] Add pure table-formatting tests for full titles, local `YYYY-MM-DD HH:mm` dates, statuses, priorities, and no-color readability in `tests/unit/output.test.ts`

### Implementation for User Story 1

- [X] T017 [US1] Implement create and unfiltered newest-first list queries in `src/db/tasks.ts`
- [X] T018 [P] [US1] Implement readable `cli-table3` rows, wrapping, local `YYYY-MM-DD HH:mm` creation-date formatting, and empty-state messages in `src/utils/output.ts`
- [X] T019 [US1] Implement the `add` command with title, description, priority, success output, and actionable errors in `src/commands/add.ts`
- [X] T020 [US1] Implement the unfiltered `list` command and table output in `src/commands/list.ts`
- [X] T021 [US1] Register `add` and `list` in `src/commands/index.ts` and implement the shebang, dependency composition, `parseAsync()`, top-level error boundary, exit codes, and guaranteed disconnect in `src/index.ts`
- [X] T022 [US1] Add a compiled subprocess smoke test for the add/list MVP, help, version, failure output without stacks, and temporary-home isolation in `tests/smoke/cli-mvp.test.ts`

**Checkpoint**: User Story 1 passes its unit and command tests and provides the minimum useful
compiled `task` executable independently of later stories.

---

## Phase 4: User Story 2 - Progress Work Through Its Lifecycle (Priority: P2)

**Goal**: Move tasks only through allowed lifecycle transitions and reject invalid, same-state,
or stale transitions without writes.

**Independent Test**: Seed a task directly in each status, exercise every allowed transition,
and verify that `todo -> done`, same-state, invalid, unknown-ID, and concurrent stale requests
fail without changing stored status.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add exhaustive pure transition-matrix tests for allowed, prohibited, and same-state changes in `tests/unit/transitions.test.ts`
- [ ] T024 [P] [US2] Add `task status` contract tests for success, invalid transitions, unknown IDs, stale writes, messages, and exit codes in `tests/commands/status.test.ts`

### Implementation for User Story 2

- [ ] T025 [US2] Implement the pure status-transition matrix and corrective error details in `src/utils/transitions.ts`
- [ ] T026 [US2] Extend `src/db/tasks.ts` with task lookup and status updates conditional on the previously validated status to reject stale writes
- [ ] T027 [US2] Implement the `status` command with transition validation and previous/new status output in `src/commands/status.ts` and register it in `src/commands/index.ts`

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

- [ ] T028 [P] [US3] Add database tests for status/priority filters, combined filters, partial updates, retained fields, description clearing, and unknown IDs in `tests/unit/tasks-filter-update.test.ts`
- [ ] T029 [P] [US3] Add filtered `task list` contract tests for valid filters, invalid values, ordering, and no-match output in `tests/commands/list-filters.test.ts`
- [ ] T030 [P] [US3] Add `task update` contract tests for each field, combined fields, empty updates, validation errors, and exit codes in `tests/commands/update.test.ts`

### Implementation for User Story 3

- [ ] T031 [US3] Extend `src/db/tasks.ts` with AND-combined list filters and partial update queries that preserve omitted values
- [ ] T032 [US3] Extend `src/commands/list.ts` with validated `--status` and `--priority` options plus no-match output
- [ ] T033 [US3] Implement the `update` command with at-least-one-field validation and explicit empty-description clearing in `src/commands/update.ts` and register it in `src/commands/index.ts`

**Checkpoint**: User Story 3 passes database and command tests and works with seeded tasks
without requiring deletion behavior.

---

## Phase 6: User Story 4 - Remove Unneeded Tasks Safely (Priority: P4)

**Goal**: Delete a task only after affirmative confirmation unless `--force` is supplied, while
preserving data on decline, interruption, invalid IDs, or non-interactive misuse.

**Independent Test**: Seed a task and verify decline, Ctrl+C-style interruption, approval,
`--force`, non-TTY without force, unknown ID, stdout/stderr, and exit codes.

### Tests for User Story 4

- [ ] T034 [P] [US4] Add database tests for task deletion, unknown IDs, and no-write failure paths in `tests/unit/tasks-delete.test.ts`
- [ ] T035 [P] [US4] Add `task delete` contract tests with injected confirmation for approve, decline, interruption, force bypass, non-TTY, and unknown-ID behavior in `tests/commands/delete.test.ts`

### Implementation for User Story 4

- [ ] T036 [US4] Extend `src/db/tasks.ts` with fetch-for-confirmation and single-task deletion queries in `src/db/tasks.ts`
- [ ] T037 [US4] Implement the `delete` command with Inquirer default-no confirmation, local cancellation handling, TTY checks, and force bypass in `src/commands/delete.ts` and register it in `src/commands/index.ts`

**Checkpoint**: User Story 4 passes deletion tests and cannot remove data without a confirmed or
forced request.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate the incrementally composed executable and complete package against
constitutional and supported-platform gates.

- [ ] T038 [P] Add compiled subprocess smoke coverage for help, version, full add/list/status/update/delete flow, failures without stacks, and temporary-home isolation in `tests/smoke/cli.test.ts`
- [ ] T039 [P] Add the 10,000-task time-to-first-stdout and ordering smoke test, enforcing the 2-second threshold on the reference CI job, in `tests/smoke/list-performance.test.ts`
- [ ] T040 [P] Add packed-tarball and isolated global pnpm installation checks for the `task` bin, compiled Prisma client, config, schema, and migrations in `tests/smoke/package.test.ts`
- [ ] T041 [P] Add Node.js 24 typecheck, test, build, and package jobs on `ubuntu-24.04` and `macos-15`, marking only Ubuntu as the authoritative 2-second performance environment, in `.github/workflows/ci.yml`
- [ ] T042 [P] Document Linux/macOS support, installation, command examples, database location, date format, status transitions, and error conventions in `README.md`
- [ ] T043 Execute every scenario in `specs/001-manage-personal-tasks/quickstart.md` and correct any documentation discrepancy in `specs/001-manage-personal-tasks/quickstart.md`
- [ ] T044 Run the `package.json` typecheck, test, build, pack, and global-install scripts and resolve all failures in `package.json`, `src/`, `tests/`, `prisma/`, and `pnpm-lock.yaml`

**Checkpoint**: The packed package installs globally with pnpm, `task` works from any directory,
all tests pass, no expected failure leaks a stack, and all constitution gates remain satisfied.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T002, T003, and T004 may proceed in parallel after the
  intended package choices are known.
- **Foundational (Phase 2)**: Depends on Setup and blocks every user story.
- **User Stories (Phases 3-6)**: Depend on Foundational. US2-US4 business behavior remains
  independently testable, but registering those commands in the shipped executable depends on
  T021. Edits to `src/db/tasks.ts` should normally be integrated in priority order unless
  contributors coordinate that shared file.
- **Polish (Phase 7)**: Depends on all selected user stories.

### User Story Dependency Graph

```text
Setup -> Foundational -> US1 (P1) -> Polish
                                -> US2 (P2) -> Polish
                                -> US3 (P3) -> Polish
                                -> US4 (P4) -> Polish
```

- **US1**: No functional dependency on another story; establishes the MVP create/list workflow.
- **US2**: Its behavior uses only the shared Task schema and seeded records; registration uses the
  command registry created by T021.
- **US3**: Its behavior does not require US2 command behavior; registration uses the command
  registry created by T021.
- **US4**: Its behavior does not require earlier lifecycle or update flows; registration uses the
  command registry created by T021.

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
- US2-US4 business behavior can be developed by separate contributors after Foundational, but
  their registration waits for T021 and changes to `src/db/tasks.ts` must be coordinated.
- Command registration tasks T021, T027, T033, and T037 share `src/commands/index.ts` and should
  follow story priority order unless contributors coordinate that file.
- Final smoke, performance, package, CI, and README tasks T038-T042 use separate files and can run
  in parallel after all selected stories are complete.

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
T023 tests/unit/transitions.test.ts
T024 tests/commands/status.test.ts
```

### User Story 3

```text
T028 tests/unit/tasks-filter-update.test.ts
T029 tests/commands/list-filters.test.ts
T030 tests/commands/update.test.ts
```

### User Story 4

```text
T034 tests/unit/tasks-delete.test.ts
T035 tests/commands/delete.test.ts
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1 only.
3. Run T013-T022 and demonstrate the compiled add/list executable against an isolated database.
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
