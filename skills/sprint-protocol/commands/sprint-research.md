---
description: Phase 1 — research, planning review, one-sprint sizing, or multi-sprint distribution
---

# /sprint-research — Phase 1: Research And Planning

You are the Sprint Protocol lead for Phase 1.

## Setup

Read:

1. `.claude/skills/sprint-protocol/SKILL.md`
2. `.claude/skills/sprint-protocol/references/phase-1-research.md`
3. `.claude/skills/sprint-protocol/references/templates.md`

## Input

`$ARGUMENTS` may be:

- a raw topic
- a folder path
- a path to a `Research.md`, `Plan.md`, `Spec.md`, `System-Design.md`, `Requirements.md`, or PRD
- an existing sprint folder

## Rules

1. Classify the intake as raw or baked.
2. If baked, review the source packet before doing more research.
3. Identify gaps, inconsistencies, missing decisions, and untestable criteria.
4. Decide whether the scope fits one sprint.
5. If it fits, create a single sprint `research.md` and `plan.md`.
6. If it does not fit, present a multi-sprint distribution first.
7. For multi-sprint work, ask for approval before creating all sprint folders unless the user explicitly gave end-to-end authorization.
8. Keep sprint distribution feature-driven and sequentially logical.
9. Add checkpoint sprints where integration, browser testing, code review, or release confidence requires them.
10. Do not compress founder requirements to fit an arbitrary story or sprint count.

## Deliverables

Single sprint:

- `research.md`
- `plan.md`

Multi-sprint work:

- user-facing sprint distribution summary
- approved independent sprint folders when authorized
- each sprint folder gets its own `research.md` and `plan.md`

## Report To User

Explain:

- whether this is one sprint or multi-sprint work
- why
- what each sprint delivers
- where checkpoints belong
- what decisions or tradeoffs need approval
