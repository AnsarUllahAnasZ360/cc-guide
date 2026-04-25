# Phase 5: Verification

Phase 5 is the explicit QA mode. It does not have to run automatically at the end of every sprint execution. Use it when the user says to verify a completed sprint, run browser QA, produce screenshots or videos, fix verification failures, create a verification report, or prepare PR/merge handoff.

The verifier reads what was planned, what was delivered, and what must be verified; runs automated and browser checks; fixes bounded sprint-caused failures; writes `verification-report.md`; and prepares PR or merge handoff when requested.

Use the platform browser tool for user-visible behavior:

- Claude/Cloud Code: Agent Browser CLI or the configured browser automation tooling
- Codex: Browser Use plugin, then any available verification plugin/tooling when appropriate

Do not claim user-visible behavior passed from code inspection alone.

## Prerequisites

- sprint `README.md`
- `sprint-completion.md`
- `verification-checklist.md`
- implemented code changes
- sprint commit or staged changes ready for verification, depending on chosen strategy

## Outputs

- fixes if needed
- evidence under `evidence/` or another explicit artifact path, only when browser/video/log proof is produced
- `verification-report.md`
- optional verification fix commit
- PR handoff when requested

## Required Context Loading

Read these files before testing:

1. `README.md` — what the sprint planned
2. all `stories/STORY-*.md` — story-level acceptance criteria
3. `progress.md` — implementation journey, worker notes, deviations, gotchas
4. `sprint-completion.md` — what was delivered, what was deferred, tests run, known issues
5. `verification-checklist.md` — what must be verified
6. prior sprint reports and checklists if this is a checkpoint sprint

After reading, explicitly identify:

- planned scope
- delivered scope
- deferred scope
- deviations
- risky areas
- verification data or credentials required

## Workflow

1. Create verification task list.
2. Confirm dev environment and services.
3. Run global/baseline checks from the verification checklist.
4. Run targeted feature tests for every story.
5. Run code review shards for risky diffs.
6. Run browser/API verification for every user-visible checklist item.
7. Capture evidence for every user-visible pass/fail and any command output needed for auditability.
8. Fix bounded sprint-caused issues immediately.
9. Re-run affected tests after fixes.
10. Run final sprint-level checks.
11. Write `verification-report.md`.
12. Create verification fix commit if needed.
13. Prepare PR handoff if requested.
14. Report `MERGE`, `NEEDS WORK`, or `BLOCKED`.

## Browser Verification

Use browser automation when the sprint changes UI, routing, forms, dashboards, authentication flows, browser-visible state, or user workflow behavior.

In Codex, use Browser Use for the same role. If a project-specific verification plugin exists, use it when it gives better coverage or evidence.

The browser verification should:

- start the dev server with the project-approved command
- navigate through the relevant route or workflow
- inspect visible state
- check console errors
- check network failures where tooling supports it
- capture screenshots or recordings
- save evidence paths
- record exact environment assumptions

If the expected browser tool is unavailable, document the blocker and use the best configured browser tool. Do not silently downgrade to code inspection.

## Fix As You Go

Fix immediately when:

- the failure was introduced by the sprint
- the fix is bounded
- the issue blocks an acceptance criterion
- the fix does not create a new feature or architecture change

Document instead of fixing when:

- the issue requires a new sprint
- missing credentials or services prevent verification
- the issue is unrelated to sprint work
- a fix would be risky without founder approval

After every fix:

- rerun the targeted test
- rerun the affected browser check
- update evidence
- document the fix

## Checkpoint Sprint Verification

Checkpoint sprints verify integrated work across prior sprints. They are still normal sprint folders, not an epic-specific artifact type.

A checkpoint sprint must read:

- previous sprint `README.md` files
- previous sprint `sprint-completion.md` files
- previous sprint `verification-checklist.md` files
- previous sprint `verification-report.md` files when they exist

Checkpoint verification should include:

- cross-sprint code review
- dependency and integration review
- browser workflows across the integrated feature
- regression tests for core user paths
- review of open issues from prior completion reports and verification reports
- repair of bounded integration failures
- recommendation on whether the initiative can continue, should pause, or needs replanning

Checkpoint output should still use `sprint-completion.md` for execution results. If Phase 5 is run for the checkpoint, write `verification-report.md`. Create a separate release-readiness report only when the user explicitly asks for one.

## Verification Report Requirements

`verification-report.md` must include:

- verdict: `MERGE`, `NEEDS WORK`, or `BLOCKED`
- branch and commit hash
- sprint goal
- planned scope
- delivered scope
- checks run
- targeted feature tests
- browser/API verification results
- evidence inventory
- fixes applied
- unresolved issues
- pre-existing issues, if any
- recommendation and rationale

Every checklist item must appear as pass, fail, blocked, or not applicable with reasoning.

## Evidence Standard

For each user-visible check, capture durable evidence:

- screenshot for static state
- recording for interactive flows
- terminal output summary for command checks
- logs for console/network/API issues
- file path or artifact reference

Evidence is not part of the normal sprint execution layout. It is created during explicit verification so the founder can trust that the system was exercised rather than imagined.

## Final Verdict

- **MERGE:** required checks pass, evidence exists, no blocking issues remain.
- **NEEDS WORK:** important issues remain, but the path to fix them is clear.
- **BLOCKED:** verification cannot proceed because environment, credentials, services, merge state, or scope decisions are missing.

## PR Handoff

If creating a PR, include:

- sprint summary
- commit hash
- story results
- test summary
- browser evidence summary
- outstanding issues
- recommendation
- link or path to `verification-report.md`
