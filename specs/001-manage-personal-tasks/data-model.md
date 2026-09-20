# Data Model: Personal Task Management CLI

## Task

The feature has one persistent entity and no relationships.

| Field | Logical Type | Required | Default | Rules |
|---|---|---:|---|---|
| `id` | Integer | Yes | Autoincrement | Positive, unique, immutable, never intentionally reused |
| `title` | Text | Yes | None | Trimmed value MUST contain at least one non-whitespace character |
| `description` | Text or null | No | null | Empty update value is normalized to null |
| `status` | Text | Yes | `todo` | One of `todo`, `in-progress`, `done` |
| `priority` | Text | Yes | `medium` | One of `high`, `medium`, `low` |
| `createdAt` | Date/time | Yes | Creation time | Immutable after insertion |

Status and priority are stored as validated strings for SQLite portability. Application-level
constants and pure parsers define the accepted values; database defaults provide defense in
depth for newly created rows.

## Prisma Shape

```prisma
model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  status      String   @default("todo")
  priority    String   @default("medium")
  createdAt   DateTime @default(now())

  @@index([createdAt, id])
  @@index([status, priority, createdAt, id])
}
```

The initial migration creates the `Task` table and indexes. Prisma migrations, not runtime
`db push`, own future schema evolution.

## Validation Rules

- IDs from CLI input MUST match a positive base-10 integer and remain within JavaScript's safe
  integer range before a database query runs.
- Titles are trimmed before validation and storage. Missing, empty, or whitespace-only titles
  are rejected.
- Description is optional. An omitted update preserves its current value; an explicitly empty
  update stores null.
- Status and priority values are parsed against closed constant sets before persistence.
- An update MUST contain at least one of title, description, or priority.
- `createdAt`, `id`, and status are not editable through the update command.

## State Transitions

```text
todo ---------> in-progress ---------> done
 ^                    |
 |                    |
 +--------------------+
 |
 +------------------------------- done (reopen)
```

| Current | Requested | Result |
|---|---|---|
| `todo` | `in-progress` | Allowed |
| `in-progress` | `done` | Allowed |
| `in-progress` | `todo` | Allowed |
| `done` | `todo` | Allowed |
| Any status | Same status | Rejected as no-op |
| `todo` | `done` | Rejected; must pass through `in-progress` |
| Any status | Any other value | Rejected as invalid |

Transition validation occurs before the update query. The write MUST also match the status that
was validated so a concurrent command cannot apply a stale transition. If the status changed
between read and write, the operation exits with an actionable retry error. A rejected or stale
transition performs no write.

## Query and Ordering Rules

- The default task query orders by `createdAt DESC`, then `id DESC` for deterministic ties.
- Status and priority filters are optional and combine with AND semantics.
- Create, status, update, and delete operations target exactly one ID.
- Unknown IDs produce a not-found application error and perform no write.

## Storage Lifecycle

1. Resolve `~/.task-cli/tasks.db` from the operating-system home directory.
2. Create `~/.task-cli` recursively when absent.
3. Apply committed migrations with the same database URL.
4. Open Prisma Client through the SQLite adapter.
5. Disconnect in a top-level `finally` block.

Tests replace the home directory with a temporary directory and never access the user's real
database.
