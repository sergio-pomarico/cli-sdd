# CLI Contract: `task`

## Global Contract

- Executable: `task`
- Help: `task --help` and `task <command> --help`
- Version: `task --version`
- Success and user-cancelled deletion write concise messages to stdout and exit 0.
- Invalid input, unknown IDs, invalid transitions, non-interactive confirmation, migration
  failures, and database failures write actionable messages to stderr and exit 1.
- Expected failures and unexpected failures MUST NOT expose stack traces.
- List output is human-readable only; JSON and other machine formats are out of scope.
- Color is optional, limited to status and priority, and never carries meaning without text.

## `task add`

```text
task add <title> [--priority <high|medium|low>] [--description <text>]
```

- `title` is required and cannot be whitespace-only.
- Priority defaults to `medium`; status always starts as `todo`.
- Success identifies the assigned ID, title, status, and priority.
- Invalid title or priority exits 1 without creating a row.

## `task list`

```text
task list [--status <todo|in-progress|done>] [--priority <high|medium|low>]
```

- Filters are optional and combine with AND semantics.
- Rows are ordered by creation date descending, then ID descending.
- Table columns are `ID`, `Title`, `Status`, `Priority`, and `Created`.
- `Created` values use local time in `YYYY-MM-DD HH:mm` format.
- Long titles wrap rather than losing content.
- With up to 10,000 tasks, the first rows appear within 2 seconds on a GitHub-hosted
  `ubuntu-24.04` runner using Node.js 24; remaining rows may continue rendering.
- No tasks produces `No tasks found.` and exit 0.
- No filter matches produces `No tasks match the selected filters.` and exit 0.

## `task status`

```text
task status <id> <todo|in-progress|done>
```

- ID MUST be a positive safe integer.
- Allowed transitions are `todo -> in-progress`, `in-progress -> done`,
  `in-progress -> todo`, and `done -> todo`.
- Same-state requests and all other transitions exit 1 without changing data.
- If another command changes the status between validation and persistence, the stale request
  exits 1 and instructs the user to retry.
- Success identifies the task and its previous and new statuses.

## `task update`

```text
task update <id> [--title <text>] [--description <text>] [--priority <high|medium|low>]
```

- At least one editable option is required.
- Omitted options retain their stored values.
- `--description ""` clears the description.
- Title and priority follow the same validation as creation.
- Success identifies the task and resulting editable values.

## `task delete`

```text
task delete <id> [--force]
```

- Without `--force`, an interactive prompt identifies the task and defaults to no.
- Declining or interrupting confirmation prints a cancellation message, preserves the task,
  and exits 0.
- In a non-interactive terminal, omission of `--force` exits 1 and instructs the user to rerun
  with `--force`.
- `--force` bypasses prompt creation entirely.
- Confirmed or forced deletion identifies the removed task and exits 0.

## Error Message Shape

```text
error: <what failed>. <specific corrective action>
```

Examples:

```text
error: Priority "urgent" is invalid. Use high, medium, or low.
error: Task 42 was not found. Run "task list" to view available tasks.
error: Cannot move task 7 directly from todo to done. Move it to in-progress first.
error: Confirmation requires an interactive terminal. Rerun with --force.
```
