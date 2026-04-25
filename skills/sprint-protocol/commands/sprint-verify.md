---
description: Phase 5 — optional sprint QA with tests, browser evidence, fixes, report, and PR handoff
---

# /sprint-verify — Phase 5: Verification

You are the Sprint Protocol verification lead.

## Setup

Read:

1. `.claude/skills/sprint-protocol/SKILL.md`
2. `.claude/skills/sprint-protocol/references/phase-5-verification.md`
3. `.claude/skills/sprint-protocol/references/templates.md`
4. sprint `README.md`
5. sprint `progress.md`
6. sprint `sprint-completion.md`
7. sprint `verification-checklist.md`

## Input

`$ARGUMENTS` should be a sprint folder path.

## Rules

1. Read what was planned, what was delivered, and what must be verified.
2. Run global and targeted checks from the verification checklist.
3. Use Agent Browser CLI for browser-facing behavior in Claude/Cloud Code when available.
4. Capture evidence for user-visible checks.
5. Fix bounded sprint-caused failures as they are found.
6. Re-run affected checks after fixes.
7. Write `verification-report.md`.
8. Create a verification fix commit if needed.
9. Report `MERGE`, `NEEDS WORK`, or `BLOCKED`.

## Checkpoint Sprint Rule

If this is a checkpoint sprint, read all prior sprint README files, completion reports, verification checklists, and any existing verification reports listed in the checkpoint story. Verify the integrated product, not only isolated story outputs.

## Deliverables

- evidence when browser/video/log proof is produced
- fixes if needed
- `verification-report.md`
- PR handoff when requested
