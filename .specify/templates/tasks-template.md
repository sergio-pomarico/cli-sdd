---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Vitest unit tests are REQUIRED for all business logic. Add CLI smoke checks for
affected command flows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Commands**: `src/commands/`
- **Database**: `src/db/`
- **Shared utilities**: `src/utils/`
- **Unit tests**: `tests/unit/` or colocated `*.test.ts`, as selected in `plan.md`

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Configure TypeScript, Node.js LTS, pnpm, and direct execution with `tsx`
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Configure Prisma and SQLite at `~/.task-cli/tasks.db`
- [ ] T005 [P] Configure Commander.js command registration
- [ ] T006 [P] Implement shared actionable error and exit-code handling
- [ ] T007 Create shared types or pure utilities required by all stories
- [ ] T008 Configure readable table output and status/priority colors if needed
- [ ] T009 Configure the executable entry point for global pnpm installation

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 *(required for business logic)*

- [ ] T010 [P] [US1] Unit test for [business rule] in tests/unit/[name].test.ts
- [ ] T011 [P] [US1] CLI smoke test for [command flow] in tests/[name].test.ts

### Implementation for User Story 1

- [ ] T012 [P] [US1] Add [Entity1] Prisma model in prisma/schema.prisma
- [ ] T013 [P] [US1] Add pure [business rule] function in src/utils/[name].ts
- [ ] T014 [US1] Implement data operation in src/db/[name].ts (depends on T012)
- [ ] T015 [US1] Implement command in src/commands/[name].ts
- [ ] T016 [US1] Add validation and error handling
- [ ] T017 [US1] Add readable output with tables and constrained colors where applicable

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 *(required for business logic)*

- [ ] T018 [P] [US2] Unit test for [business rule] in tests/unit/[name].test.ts
- [ ] T019 [P] [US2] CLI smoke test for [command flow] in tests/[name].test.ts

### Implementation for User Story 2

- [ ] T020 [P] [US2] Add [Entity] Prisma model or pure utility in [exact path]
- [ ] T021 [US2] Implement data operation in src/db/[name].ts
- [ ] T022 [US2] Implement command in src/commands/[name].ts
- [ ] T023 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 *(required for business logic)*

- [ ] T024 [P] [US3] Unit test for [business rule] in tests/unit/[name].test.ts
- [ ] T025 [P] [US3] CLI smoke test for [command flow] in tests/[name].test.ts

### Implementation for User Story 3

- [ ] T026 [P] [US3] Add [Entity] Prisma model or pure utility in [exact path]
- [ ] T027 [US3] Implement data operation in src/db/[name].ts
- [ ] T028 [US3] Implement command in src/commands/[name].ts

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional Vitest unit tests in tests/unit/
- [ ] TXXX Verify global installation and executable command with `pnpm add -g`
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Required business-logic tests MUST be included and pass before the story is complete
- Prisma schema changes before database operations
- Database operations and pure logic before commands
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for [business rule] in tests/unit/[name].test.ts"
Task: "CLI smoke test for [command flow] in tests/[name].test.ts"

# Launch all models for User Story 1 together:
Task: "Add [Entity1] Prisma model in prisma/schema.prisma"
Task: "Add pure [business rule] function in src/utils/[name].ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Ensure all changed business logic has passing Vitest tests
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
