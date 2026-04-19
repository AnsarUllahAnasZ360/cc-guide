# Phase 4: Execution

Use when reviewed stories and a verification checklist exist and the user asks to implement or execute the sprint.

## Prerequisites

- `sprints/<name>/README.md`
- `sprints/<name>/stories/STORY-*.md`
- `sprints/<name>/verification-checklist.md`

## Outputs

- code changes
- one commit per completed story when possible
- `sprints/<name>/progress.md`
- `sprints/<name>/sprint-completion.md`
- updated `sprints/<name>/state.md`

## Lead Workflow

1. Run `sprint-doctor`.
2. Inspect `git status --short --branch`; preserve unrelated changes.
3. Read README, stories, verification checklist, and existing progress.
4. Update `state.md` with queue order and dependency notes.
5. Call `update_plan`.
6. Initialize `progress.md` if missing.
7. Launch at most two active `worker` agents for independent stories.
8. Wait for completions, integrate results, inspect commits, update `progress.md` and `state.md`.
9. Keep the queue full while respecting dependencies and overlapping files.
10. After all stories, run a final project check agent or run checks directly.
11. Write `sprint-completion.md`.
12. Commit Phase 4 artifacts.
13. Close all subagents and report readiness for Phase 5.

## Worker Launch Rules

Use `agent_type: worker`. Assign exactly one story by default. Batch only when stories are small, related, and touch the same surface.

Worker prompt must include:

- story file path
- sprint README path
- progress path
- worker-guide path
- exact edit scope
- required checks
- commit message format
- instruction to stage only relevant files
- instruction to append to `progress.md`

## Concurrency

- Default: two active workers maximum.
- Use one worker when stories share files, migrations, schemas, routing, or generated artifacts.
- Allow more than two only for read-only audits or when the user explicitly accepts higher merge/conflict risk.
- Do not leave active workers running at final response.

## Completion Criteria

Each completed story should have:

- implementation committed
- tests added or updated when appropriate
- targeted checks run
- known full-suite failures documented
- `progress.md` entry with commit hash
- no unrelated files staged

If a worker returns partial or blocked, do not silently mark complete. Update `state.md`, decide whether to reassign, narrow scope, or ask the user.
