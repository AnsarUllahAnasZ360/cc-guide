# Phase 5: Verification

Use when implementation is complete and the user asks to verify, prove, review, create evidence, or prepare a PR.

## Prerequisites

- `sprints/<name>/sprint-completion.md`
- `sprints/<name>/verification-checklist.md`
- implemented story commits

## Outputs

- fixes if needed
- evidence under `sprints/<name>/evidence/` or the verification plugin artifact path
- `sprints/<name>/verification-report.md`
- PR when requested or appropriate

## Workflow

1. Run `sprint-doctor`.
2. Read README, all stories, all of `progress.md`, sprint completion, and verification checklist.
3. Build a verification plan with `update_plan`.
4. Discover available verification capabilities with `tool_search` when needed:
   - ProofOps / `verify-pr-proof`
   - GitHub PR review and CI tools
   - Vercel Agent Browser or browser verification
   - framework-specific diagnostics
5. Run global checks: typecheck, lint, test, build, or the repo equivalents.
6. Run code review shards with `explorer` agents for risky or large diffs.
7. Run browser/API verification for every checklist item that affects user-visible behavior.
8. Fix failures as they are accepted. Use `worker` agents for bounded fix groups.
9. Re-run affected checks after each fix and final global checks at the end.
10. Write `verification-report.md`.
11. Create or update the PR if the user asked for merge handoff.
12. Report `MERGE`, `NEEDS WORK`, or `BLOCKED`.

## Verification Plugin Handoff

If ProofOps or another verification skill/plugin is available and appropriate, invoke it rather than reimplementing its workflow. Provide:

- sprint name
- branch and base branch
- sprint artifact paths
- verification checklist path
- definition of done
- required evidence
- known blockers from `sprint-completion.md`

The Sprint Protocol lead remains responsible for integrating the result into `verification-report.md` and updating `state.md`.

## Evidence Standard

For each user-visible check, capture durable evidence:

- screenshot for static state
- recording for interactive flows when tooling supports it
- logs for console, network, API, or command output
- exact command output summary for CLI-only checks

Do not claim a browser flow passed solely from code inspection.

## Fix Policy

Fix immediately when:

- the issue is caused by sprint changes
- the fix is bounded
- the acceptance criteria cannot pass without it

Document instead of fixing when:

- the issue requires a new sprint or major architecture change
- credentials or services are missing
- the issue is unrelated and risky to modify
- the user explicitly asks for report-only verification

## Final Verdict

- `MERGE`: required checks pass, evidence exists, no blocking issues.
- `NEEDS WORK`: important issues remain but the path forward is clear.
- `BLOCKED`: verification cannot proceed due to missing environment, credentials, or unresolved merge/runtime state.
