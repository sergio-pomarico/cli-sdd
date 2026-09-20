# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript on a supported Node.js LTS release

**Primary Dependencies**: Commander.js, Inquirer, Prisma ORM; justify any additions

**Storage**: SQLite via Prisma at `~/.task-cli/tasks.db`, or N/A when unaffected

**Testing**: Vitest unit tests for all business logic; CLI smoke checks where applicable

**Target Platform**: Local CLI on Node.js LTS, globally installable with pnpm

**Project Type**: Single CLI project

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Toolchain**: Uses TypeScript, Node.js LTS, pnpm, and `tsx` or an equivalent runner.
- **CLI contract**: Uses Commander.js and Inquirer appropriately; defines readable output,
  tabular lists, actionable errors without stack traces, and exit codes 0/1.
- **Persistence**: Uses Prisma with SQLite at `~/.task-cli/tasks.db` when data is stored.
- **Structure**: Keeps a flat `commands/`, `db/`, `utils/` layout and prefers functional code.
- **Tests**: Includes Vitest unit tests for every changed business rule.
- **Dependencies**: Justifies each new dependency against a small in-project implementation.
- **Distribution**: Preserves the executable entry point and `pnpm add -g` installation.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── commands/
├── db/
├── utils/
└── index.ts

tests/
└── unit/
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
