<!--
Sync Impact Report
- Version change: template (unratified) -> 1.0.0
- Modified principles:
  - Initial adoption -> I. TypeScript Toolchain and Local Persistence
  - Initial adoption -> II. Predictable CLI Experience
  - Initial adoption -> III. Functional Simplicity
  - Initial adoption -> IV. Tested Business Logic
  - Initial adoption -> V. Minimal, Globally Installable Product
- Added sections:
  - Technology and Data Constraints
  - Development Workflow and Quality Gates
- Removed sections: None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: None
-->
# cli-sdd Constitution

## Core Principles

### I. TypeScript Toolchain and Local Persistence
The project MUST use TypeScript on a currently supported Node.js LTS release, pnpm as the
package manager, and `tsx` or an equivalent TypeScript execution tool during development.
Task data MUST be persisted with Prisma ORM in a local SQLite database at
`~/.task-cli/tasks.db`. These choices provide a single, reproducible toolchain and keep user
data local without requiring an external service.

### II. Predictable CLI Experience
Commander.js MUST parse commands and arguments, and Inquirer MUST be used when a command
requires interactive input. User-facing output MUST be readable in a terminal; list output
MUST use tables, and color MUST be limited to task status and priority. Expected failures MUST
produce clear, actionable messages without stack traces. Successful commands MUST exit with
code 0 and failed commands with code 1. This contract makes the CLI usable both directly and
from shell scripts.

### III. Functional Simplicity
Source code MUST remain organized by feature in a small, flat structure based on `commands/`,
`db/`, and `utils/`. Implementations MUST prefer functions over classes and pure functions
whenever practical. Variables and functions MUST use camelCase; types and interfaces MUST use
PascalCase. Clean Architecture, speculative abstractions, and additional layers MUST NOT be
introduced unless a concrete requirement demonstrates that the simpler structure is
insufficient.

### IV. Tested Business Logic
All business logic MUST have unit tests written with Vitest. Tests MUST cover successful
behavior and relevant validation or failure paths. No minimum coverage percentage is imposed,
and trivial framework wiring does not require isolated tests. A change that modifies business
rules is incomplete until its tests pass.

### V. Minimal, Globally Installable Product
Dependencies MUST only be added when the required behavior cannot be implemented clearly and
maintainably in a few lines of project code. Runtime dependencies MUST have a direct product
purpose. The package MUST expose an executable entry point and remain installable with
`pnpm add -g`; every release-affecting change MUST preserve global command execution.

## Technology and Data Constraints

- Runtime: a supported Node.js LTS release with TypeScript and ESM.
- Package and script execution: pnpm and `tsx` or an equivalent direct TypeScript runner.
- CLI libraries: Commander.js for parsing, Inquirer for interactive prompts, and `cli-table3`
  or a justified equivalent for tabular lists.
- Persistence: Prisma ORM backed by SQLite at `~/.task-cli/tasks.db`.
- Database initialization MUST create the `~/.task-cli` directory when absent and MUST NOT
  write the production database into the repository.
- Terminal colors MUST communicate only status or priority and MUST NOT be required to
  understand output.

## Development Workflow and Quality Gates

Every feature specification MUST define its command behavior, terminal output, error cases,
and persistence impact. Every implementation plan MUST demonstrate compliance with the fixed
toolchain, flat source layout, local database path, dependency restraint, testing requirements,
and global installation contract before implementation begins and again after design.

Implementation tasks MUST include Vitest coverage for all changed business logic and an
end-to-end smoke check for affected CLI commands. Reviews MUST reject stack-trace leakage,
non-actionable errors, unjustified dependencies or architecture layers, misuse of terminal
color, and changes that break `pnpm add -g` installation or execution.

## Governance

This constitution supersedes conflicting project documentation and development practices.
Amendments MUST document the reason, update the Sync Impact Report, propagate changes to all
dependent templates and guidance, and receive project-owner approval. Constitution versions
follow semantic versioning: MAJOR for incompatible principle removals or redefinitions, MINOR
for new principles or materially expanded mandatory guidance, and PATCH for clarifications
without governance impact.

Every specification, plan, task list, and code review MUST verify compliance. Any deliberate
exception MUST be recorded in the plan's Complexity Tracking section with the violated rule,
why the exception is necessary, and why a simpler compliant alternative is insufficient.

**Version**: 1.0.0 | **Ratified**: 2026-09-19 | **Last Amended**: 2026-09-19
