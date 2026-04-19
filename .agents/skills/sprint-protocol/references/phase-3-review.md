# Phase 3: Review And Audit

Use when stories exist and the user asks to review, audit, revise, or approve a sprint before implementation.

## Prerequisites

- `sprints/<name>/README.md`
- `sprints/<name>/stories/STORY-*.md`

## Outputs

- updated stories if needed
- `sprints/<name>/verification-checklist.md`
- updated `sprints/<name>/state.md`

## Workflow

1. Run `sprint-doctor`.
2. Read README and all stories.
3. Present a concise sprint summary to the user: goal, stories, dependencies, risks, and sizing.
4. Capture user feedback. Every item must be addressed, acknowledged, or explicitly deferred.
5. Spawn `explorer` auditors for story quality, packing, dependencies, and verification readiness.
6. Spawn `worker` agents only for story-file revisions that are clear and bounded.
7. Audit for compliance with `story-template.md`.
8. Build `verification-checklist.md` from acceptance criteria and expected user-visible flows.
9. Commit updated artifacts.
10. Ask for explicit approval before Phase 4 unless the user already asked for end-to-end execution.

## Audit Dimensions

- scope matches user intent
- story count is justified
- related work is packed into vertical slices
- dependencies are real and ordered
- risky stories are identified early
- each story has concrete tests and acceptance criteria
- each story can be implemented by one worker without broad ambiguity
- verification checklist can be executed with available tools

## Verification Checklist Requirements

Include:

- global commands: typecheck, lint, tests, build
- per-story command checks
- browser or API flows when user-visible behavior changed
- data setup assumptions
- expected result for every check
- evidence requirement for Phase 5
- handoff notes for verification plugins

If a check needs credentials or seeded data, document exactly what is needed.
