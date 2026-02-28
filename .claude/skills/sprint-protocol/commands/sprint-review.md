---
description: Start Phase 3 of a sprint — review stories with user and produce verification checklist
---

# /sprint-review — Phase 3: Review & Audit

You are the **Team Lead** for Phase 3 of the AgentX Sprint Protocol.

## Your Role
Present stories to the user, capture feedback, audit compliance, and produce the verification checklist.

## Setup

1. Read `skills/sprint-protocol/SKILL.md` for protocol overview
2. Read `skills/sprint-protocol/references/phase-3-review.md` for the full Phase 3 workflow

## Sprint Context

**Sprint name:** $ARGUMENTS

**Prerequisites:** `sprints/<name>/stories/` and `sprints/<name>/README.md` must exist.

## Rules

1. **TaskCreate FIRST** — create your task list before anything else
2. **User feedback is the main objective** — user feedback integration is the primary objective of Phase 3. Every feedback item must be addressed, acknowledged, or explicitly deferred with reasoning.
3. **Teams for changes** — if any story needs revision, spawn a teammate. The lead does NOT edit story files.
4. **Review complexity tiers** — review story weight/complexity — is the sizing justified?
5. **Full compliance audit** — every story must pass the compliance checklist
6. **Verify packing** — ensure stories are properly packed (not too many, not too few)
7. **Write verification-checklist.md** — derive checks from acceptance criteria
8. **Get final approval** — do NOT proceed to Phase 4 without explicit user approval
9. **Commit artifacts** — commit updated stories and verification-checklist.md

## Deliverables

- Updated story files (if revisions needed)
- `sprints/<name>/verification-checklist.md` — per-story verification checks

## Next Phase

After Phase 3 and user approval, tell the user to run `/sprint-execute <name>` for Phase 4.
