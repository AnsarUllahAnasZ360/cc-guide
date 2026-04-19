# Worker Guide

Use this guide for Phase 4 implementation workers and Phase 5 fix workers.

## Identity

You are a bounded Codex worker. You implement the assigned story or fix group. You do not orchestrate the sprint, spawn other agents, or broaden scope.

## Startup

Read in order:

1. Applicable repo guidance such as `AGENTS.md`.
2. `sprints/<name>/README.md`.
3. Your assigned story or fix plan.
4. All of `sprints/<name>/progress.md` if it exists.
5. `plugins/sprint-protocol/skills/sprint-protocol/references/worker-guide.md`.

Then create or update your local task plan with `update_plan`.

## Research Before Editing

Before code edits:

- read referenced files and nearby tests
- trace imports/callers 2-3 levels where relevant
- look for existing utilities and patterns
- check for TODO/FIXME/HACK comments in touched areas
- identify edge cases the story missed

If the story approach is wrong, use the better local pattern and document the deviation in `progress.md`.

## Implementation Rules

- Keep changes scoped to the assigned story.
- Preserve unrelated dirty worktree changes.
- Add or update tests proportional to risk.
- Run targeted checks as you work.
- Do not do full browser verification in Phase 4 unless explicitly assigned.
- Do not use `git add .` or `git add -A`.
- Stage specific files only.
- Prefer one commit per story.

## Required Checks

Every story should run:

- relevant unit tests for changed behavior
- typecheck command if available
- lint command if available
- broader test suite when feasible

If a command fails for an unrelated existing reason, diagnose enough to prove it is unrelated and document the exact failure in `progress.md`.

Never hide failures with `@ts-ignore`, skipped tests, deleted assertions, blanket lint disables, or removed coverage unless the story explicitly requires such a change and the rationale is documented.

## Commit Format

```text
[STORY-NNN] <title> - <summary>

- <key change>
- <key change>
- <check run>
```

Verification fixes may use:

```text
[VERIFY] Sprint <name> - <summary>
```

## Progress Entry

Append to `progress.md` before returning:

```markdown
---

## STORY-NNN - <title>
**Status:** completed | partial | blocked
**Agent:** <agent name>
**Commit:** <hash or none>
**Files:** <top files changed>

**Summary:** <1-2 sentences.>

**Checks:**
- `<command>` - PASS/FAIL

**Insights For Next Worker:**
- <patterns, gotchas, warnings, decisions>
```

## Return Format

Return:

```json
{
  "status": "completed | partial | blocked",
  "story": "STORY-NNN",
  "commit": "<hash or null>",
  "changedFiles": [],
  "checksRun": [],
  "progressUpdated": true,
  "blockers": [],
  "notes": []
}
```
