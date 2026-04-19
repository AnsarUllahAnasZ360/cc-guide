# Phase 2: Story Writing

Use when research and plan artifacts exist and the user asks to write sprint stories.

## Prerequisites

- `sprints/<name>/research.md`
- `sprints/<name>/plan.md`

If either file is missing, stop and run Phase 1 first.

## Outputs

- `sprints/<name>/README.md`
- `sprints/<name>/stories/STORY-NNN.md`
- updated `sprints/<name>/state.md`

## Workflow

1. Run `sprint-doctor`.
2. Read `research.md` and `plan.md`.
3. Call `update_plan` for story queue, writer batches, compliance audit, README, and commit.
4. Create `stories/`.
5. Spawn story writers in batches of at most two agents. Each writer may handle up to two tightly related stories.
6. Require writers to do targeted repo research before writing. They must not merely copy Phase 1 text.
7. Audit every story against `story-template.md`.
8. Write `README.md` from the final story set.
9. Commit the story files and README.
10. Report story count, sizing rationale, risks, and next phase.

## Story Writer Prompt Shape

```text
You are a story writer for Sprint <name>.

Assigned stories:
- STORY-NNN: <title>

Read first:
- sprints/<name>/research.md
- sprints/<name>/plan.md
- plugins/sprint-protocol/skills/sprint-protocol/references/story-template.md
- relevant repo guidance

For each story:
- research referenced files and nearby tests
- challenge the proposed approach if the codebase suggests a better path
- write the story file at sprints/<name>/stories/STORY-NNN.md

Rules:
- Do not implement product code.
- Do not create browser verification tasks.
- Include required skills/tools when useful.
- Include exact file paths and line numbers when possible.
- Keep tasks substantial: 5-12 tasks, vertical slice, tests included.

Return a summary of files written, concerns, and any recommended packing changes.
```

## Compliance Checklist

Every story must include:

- overview
- problem and current state
- solution approach with a note that the worker must verify the approach
- research items
- required skills/tools when applicable
- 5-12 substantial tasks
- test, typecheck, lint, full test suite, self-review, and progress update tasks
- functional and technical acceptance criteria
- codebase references
- sizing and dependencies

Reject stories that:

- split tests away from implementation
- split one feature horizontally by layer
- have browser verification inside Phase 4
- lack specific validation steps
- reference nonexistent files without saying they are inferred targets
