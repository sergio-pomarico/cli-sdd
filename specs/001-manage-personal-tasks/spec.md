# Feature Specification: Personal Task Management CLI

**Feature Branch**: `main`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Build cli-sdd to create, list, progress, update, and delete personal tasks from the terminal."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture and Review Tasks (Priority: P1)

A user records a personal task from the terminal and immediately reviews the task list to
confirm that the work was captured with the correct defaults and details.

**Why this priority**: Creating and viewing tasks establishes the minimum useful task tracker.

**Independent Test**: Create tasks with only a title and with all optional fields, then list
them and verify their identifiers, details, defaults, and ordering.

**Acceptance Scenarios**:

1. **Given** no existing tasks, **When** the user creates a task with a non-empty title,
   **Then** the task receives a unique numeric ID, status `todo`, priority `medium`, and a
   creation timestamp.
2. **Given** existing tasks, **When** the user creates a task with a title, description, and
   valid priority, **Then** all supplied values are retained and the new task appears first in
   the default task list.
3. **Given** multiple tasks, **When** the user lists tasks, **Then** each row shows ID, title,
   status, priority, and creation date in newest-first order.
4. **Given** a create request with a missing or whitespace-only title, **When** the command is
   evaluated, **Then** no task is created and the user receives an actionable validation error.

---

### User Story 2 - Progress Work Through Its Lifecycle (Priority: P2)

A user changes a task between backlog, active work, and completion while the system prevents
workflow states that would skip required progress.

**Why this priority**: Status progression turns a static task list into a usable workflow.

**Independent Test**: Create a task and exercise every allowed transition plus the prohibited
direct transition from `todo` to `done`.

**Acceptance Scenarios**:

1. **Given** a task in `todo`, **When** the user changes it to `in-progress`, **Then** the new
   status is retained and shown in subsequent listings.
2. **Given** a task in `in-progress`, **When** the user changes it to `done` or `todo`, **Then**
   the selected valid status is retained.
3. **Given** a task in `done`, **When** the user reopens it as `todo`, **Then** the task returns
   to the backlog.
4. **Given** a task in `todo`, **When** the user attempts to change it directly to `done`,
   **Then** the request fails, the status remains `todo`, and the message explains that the task
   must first move through `in-progress`.

---

### User Story 3 - Find and Correct Tasks (Priority: P3)

A user narrows a large task list by status and priority, then corrects the editable details of
an existing task without recreating it.

**Why this priority**: Filtering and correction keep the list useful as task volume grows.

**Independent Test**: Seed tasks with multiple statuses and priorities, verify each filter and
their combination, then update each editable field independently and together.

**Acceptance Scenarios**:

1. **Given** tasks with different statuses, **When** the user filters by one valid status,
   **Then** only tasks with that status are shown in newest-first order.
2. **Given** tasks with different priorities, **When** the user filters by one valid priority,
   **Then** only tasks with that priority are shown.
3. **Given** both status and priority filters, **When** the user lists tasks, **Then** only tasks
   satisfying both filters are shown.
4. **Given** an existing task, **When** the user updates any combination of title, description,
   or priority, **Then** supplied fields change and all omitted fields remain unchanged.

---

### User Story 4 - Remove Unneeded Tasks Safely (Priority: P4)

A user removes an obsolete task while receiving protection from accidental deletion and can
explicitly bypass confirmation for scripted use.

**Why this priority**: Deletion is useful maintenance but is less essential than the task
lifecycle and must not create avoidable data loss.

**Independent Test**: Attempt deletion and decline confirmation, approve confirmation, and use
the force option; verify data after each path.

**Acceptance Scenarios**:

1. **Given** an existing task and no force option, **When** the user requests deletion,
   **Then** the CLI displays the task identity and asks for confirmation before changing data.
2. **Given** a pending deletion confirmation, **When** the user declines, **Then** the command
   ends without error and the task remains unchanged.
3. **Given** an existing task, **When** the user confirms deletion or supplies the force option,
   **Then** the task is removed and no longer appears in listings.

### Edge Cases

- Listing an empty task collection produces a clear empty-state message rather than a malformed
  or header-only table.
- Invalid status and priority values are rejected with the complete set of accepted values.
- A non-numeric, zero, negative, or unknown task ID produces an actionable not-found or invalid
  identifier error and does not modify data.
- Requesting the task's current status again is rejected as a no-op with its current status
  identified.
- Updating a task without any editable field is rejected and leaves the task unchanged.
- Updating the title to an empty or whitespace-only value is rejected.
- Setting the description to an empty value removes the existing description.
- An empty result after filtering displays a clear no-matches message.
- Tasks created at the same recorded time have deterministic newest-first ordering by higher ID.
- Interrupting an interactive deletion confirmation leaves the task unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST create a task only when provided a non-empty, non-whitespace title.
- **FR-002**: The system MUST accept an optional description and an optional priority of `high`,
  `medium`, or `low` when creating a task.
- **FR-003**: The system MUST assign `medium` priority and `todo` status when those values are
  not supplied at creation.
- **FR-004**: The system MUST assign each task a unique, monotonically increasing numeric ID
  that is not reused after deletion.
- **FR-005**: The system MUST record a creation date for every task.
- **FR-006**: The system MUST list all tasks by default in descending creation order, using
  descending ID as the tie-breaker.
- **FR-007**: The system MUST allow listing to be filtered by one status and one priority, with
  both filters applied together when both are supplied.
- **FR-008**: The system MUST support only `todo`, `in-progress`, and `done` task statuses.
- **FR-009**: The system MUST allow status transitions from `todo` to `in-progress`, from
  `in-progress` to `done` or `todo`, and from `done` to `todo`.
- **FR-010**: The system MUST reject every status transition not listed in FR-009, including a
  direct transition from `todo` to `done`, without changing the task.
- **FR-011**: The system MUST allow an existing task's title, description, and priority to be
  updated individually or together while retaining omitted fields.
- **FR-012**: The system MUST require at least one editable field for an update and MUST apply
  the same title and priority validation used during creation.
- **FR-013**: The system MUST treat an explicitly empty description during update as a request
  to remove the description.
- **FR-014**: The system MUST request confirmation before deleting a task unless the user
  explicitly selects the force option.
- **FR-015**: The system MUST leave a task unchanged when deletion is declined or confirmation
  is interrupted.
- **FR-016**: The system MUST provide clear, actionable errors for invalid inputs, unknown task
  IDs, invalid transitions, and failed operations without exposing diagnostic traces.
- **FR-017**: The system MUST preserve all successful changes so they are visible to later CLI
  invocations from any working directory.
- **FR-018**: The system MUST NOT include users, authentication, external synchronization, due
  dates, subtasks, task dependencies, tags, categories, a web interface, or a REST API.

### CLI Behavior *(mandatory)*

- **Command Syntax**:
  - `cli-sdd add <title> [--priority high|medium|low] [--description <text>]`
  - `cli-sdd list [--status todo|in-progress|done] [--priority high|medium|low]`
  - `cli-sdd status <id> <todo|in-progress|done>`
  - `cli-sdd update <id> [--title <text>] [--description <text>] [--priority high|medium|low]`
  - `cli-sdd delete <id> [--force]`
- **Interactive Flow**: Deletion without `--force` prompts for confirmation and defaults to no;
  all other required values are supplied through arguments or options.
- **Success Output**: Mutating commands identify the affected task and resulting values. List
  output is a readable table with ID, title, status, priority, and creation date columns.
- **Error Behavior**: Validation, not-found, and invalid-transition errors state the problem and
  the valid next action without diagnostic traces.
- **Exit Codes**: Successful operations and user-cancelled deletion return 0; validation,
  not-found, invalid-transition, and operation failures return 1.
- **Persistence Impact**: Add creates one task; list reads without mutation; status and update
  modify one identified task; confirmed or forced delete removes one identified task.

### Key Entities *(include if feature involves data)*

- **Task**: A personal work item with a unique numeric ID, required title, optional description,
  status (`todo`, `in-progress`, or `done`), priority (`high`, `medium`, or `low`), and immutable
  creation date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a task and find it in the task list in under 30 seconds.
- **SC-002**: 100% of valid lifecycle transitions are retained, and 100% of prohibited
  transitions are rejected without changing task data.
- **SC-003**: For collections of up to 10,000 tasks, users see a filtered or unfiltered list
  within 2 seconds of issuing the command on a typical personal computer.
- **SC-004**: 100% of displayed task lists include the five required fields and preserve
  newest-first ordering.
- **SC-005**: Users can invoke `cli-sdd` from any working directory after installation without
  project-specific setup.
- **SC-006**: Every invalid command covered by the requirements identifies the error and a valid
  corrective action without exposing internal diagnostic details.
- **SC-007**: Declined or interrupted deletion attempts preserve the target task in 100% of
  verification cases.

## Assumptions

- The CLI serves one local user and all commands operate on that user's single task collection.
- Status and priority filters combine using AND semantics.
- Creation dates are displayed in a consistent, human-readable local date and time format.
- There is no alternate sort option in this version; newest-first is always used.
- Updates are partial, and fields omitted from an update retain their existing values.
- Explicitly providing an empty description removes it; descriptions are otherwise optional.
- Deletion confirmation defaults to no, and cancelling a deletion is a successful no-change
  outcome.
- Task IDs continue increasing after deletions and are never recycled.
