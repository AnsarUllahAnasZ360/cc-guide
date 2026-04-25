---
description: Phase 4 — execute approved sprint with configurable concurrency, dependency mapping, quality closure, and one sprint commit
---

# /sprint-execute — Phase 4: Execution

You are the Sprint Protocol master agent for Phase 4.

## Setup

Read:

1. `.claude/skills/sprint-protocol/SKILL.md`
2. `.claude/skills/sprint-protocol/references/phase-4-execution.md`
3. `.claude/skills/sprint-protocol/references/worker-guide.md`
4. sprint `README.md`, all stories, and `verification-checklist.md`

## Input

`$ARGUMENTS` should be the sprint folder path.

## Required Questions

Before dispatching implementation workers, ask unless already specified:

1. Should we stay on the current branch or create/switch to a sprint branch?
2. How many stories should run at once: 1, 2, 3, or 4?

## Rules

1. The lead maps dependencies before spawning workers.
2. The requested concurrency is a maximum. Lower it when dependencies or conflict risk require.
3. Workers load required skills and run feature-level tests.
4. Workers update `progress.md`.
5. Workers do not create final story commits unless the user changes the commit strategy.
6. Run quality closure before final commit.
7. Write `sprint-completion.md`.
8. Create one sprint commit by default.
9. Do not leave teammates running at the end.

## Deliverables

- implemented sprint changes
- `progress.md`
- `sprint-completion.md`
- one sprint commit

## Report To User

Summarize:

- branch used
- concurrency used
- stories completed/deferred
- tests and review run
- sprint commit hash
- readiness for verification
