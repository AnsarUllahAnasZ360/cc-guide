# Sprint Artifact Templates

Templates for all sprint artifacts produced during the AgentX Sprint Protocol lifecycle.

---

## README.md (Phase 2 Output)

```markdown
# Sprint: <name>

## Sprint Goal
[1-2 sentences. The single most important outcome.]

## Problem Statement
[What problems does this sprint address? Why now?]

## Scope

### In Scope
- [Bullet list of features, fixes, changes]

### Out of Scope
- [What is NOT included]

## Stories Overview

| ID | Title | Tier | Status |
|----|-------|------|--------|
| STORY-001 | [Title] | complex | pending |
| STORY-002 | [Title] | simple | pending |

## Dependencies

- STORY-001 blocks STORY-003
- [List all cross-story dependencies]

## Success Criteria
1. [Measurable outcome]
2. All stories pass typecheck and lint
3. All tests pass
4. No regressions
```

### Notes
- **Tier**: `complex` (Opus 4.6) or `simple` (Sonnet 4.6). Default to `complex`.
- Target 4-8 stories. Maximum 15.
- No phase gates in README -- they are derived during review (Phase 3).

---

## research.md (Phase 1 Output)

```markdown
# Sprint: <name> -- Research

## Overview
[2-3 sentences. What was investigated and why.]

## Feature Areas

### [Area 1 Name]
**Current state:** [What exists today]
**Files:**
- `path/to/file.ts:line` -- [What it does]
- `path/to/other.ts:line` -- [What it does]

**Patterns:** [How similar things are done in the codebase]
**Gaps:** [What's missing or broken]

### [Area 2 Name]
[Same structure]

## Schema State
[Relevant database/schema fields, indexes, relationships]

## Cross-Cutting Concerns
- [Shared utilities, common patterns, auth/permissions]
- [CSS/styling conventions]
- [Testing patterns]

## Open Questions
- [Unresolved items for user clarification]
- [Technical decisions that need input]
```

---

## plan.md (Phase 1 Output)

```markdown
# Sprint: <name> -- Plan

## Sprint Goal
[1-2 sentences]

## Scope

### In Scope
- [Feature/fix 1]
- [Feature/fix 2]

### Out of Scope
- [Explicitly excluded items]

## Proposed Stories

| ID | Title | Brief | Tier | Research Items |
|----|-------|-------|------|----------------|
| STORY-001 | [Verb-first title] | [1 sentence] | complex | [Files/areas to investigate] |
| STORY-002 | [Verb-first title] | [1 sentence] | simple | [Files/areas to investigate] |

### Story Count Justification
[Why this number of stories? Why can't they be merged further? Why shouldn't they be split?
Also address: does the count reflect good packing -- or could stories be combined without overloading?]

### Story Order
[Explain the execution sequence and reasoning.]
- STORY-001 goes first because: [reason -- e.g., sets up shared schema other stories depend on]
- STORY-002 follows because: [reason -- e.g., builds on types introduced by STORY-001]
- STORY-003 can run in parallel with STORY-002 because: [reason -- no shared files]
- [Continue for all stories]

### Packing Strategy
[Explain what was merged into single stories vs separated and why.]
- Merged [X and Y] into STORY-001 because: [reason -- same files, tight coupling, small scope individually]
- Kept [A] separate from [B] because: [reason -- different tiers, different feature areas, risk isolation]
- [Justify any story that touches 5+ files -- is it truly cohesive or should it be split?]

### Sprint Efficiency Assessment
- [ ] No unnecessary stories -- every story maps to a sprint goal requirement
- [ ] No over-distribution -- work is not spread across too many small stories that could be combined
- [ ] No overloaded stories -- no single story carries disproportionate scope or risk
- [ ] Tier assignments are justified -- complex stories genuinely need Opus 4.6
- [Brief narrative: 1-2 sentences confirming the sprint is lean and well-balanced]

## Dependencies
- STORY-001 must complete before STORY-003 (shared schema)
- [List all dependencies with reasons]

## Complexity Estimates
- Total files: ~[N]
- Total lines changed: ~[N]
- Estimated agent time: ~[N] hours

## Phase Gates
| Gate | After Story | Checks |
|------|-------------|--------|
| Gate 1 | STORY-NNN | typecheck, lint, tests |
| Gate 2 | STORY-NNN | typecheck, lint, tests |
```

---

## verification-checklist.md (Phase 3 Output)

```markdown
# Sprint: <name> -- Verification Checklist

> Used by Phase 5 (Verification) to validate all sprint work.

## Overall Sprint Checks

- [ ] `tsc --noEmit` (or project typecheck command) passes with zero errors
- [ ] Lint passes with zero errors
- [ ] `npm test` (or project test command) -- all tests pass
- [ ] Build succeeds without errors
- [ ] No console errors on main routes

## Per-Story Verification

### STORY-001: [Title]

**Test commands:**
- [ ] `npm test -- --grep "STORY-001 related tests"`
- [ ] [Specific test command]

**Pages/routes to verify:**
- [ ] `/route/path` -- [Expected behavior]
- [ ] `/another/route` -- [Expected behavior]

**Acceptance criteria checks:**
- [ ] [Criterion 1 from story] -- [How to verify]
- [ ] [Criterion 2 from story] -- [How to verify]

### STORY-002: [Title]
[Same structure]

## Integration Checks
- [ ] [Cross-story interaction 1]
- [ ] [Cross-story interaction 2]
```

---

## progress.md (Phase 4 -- Memory File)

```markdown
# Sprint: <name> -- Progress

> **APPEND-ONLY.** Each worker appends at the bottom. Never edit previous entries.
> Workers MUST read ALL entries before starting their story.
> The "Insights for next worker" section is how workers share knowledge.

---
```

### Memory File Guidelines

progress.md is the team's shared memory. It has no hard size limit.

**Rules:**
- Append-only -- never edit or delete previous entries
- Workers MUST read ALL of it before starting (not just last 3 entries)
- Workers MUST append an entry after completing their story
- The "Insights for next worker" section is the most important part
- Include commit hash so the lead can verify

**Entry format:**

```markdown
---

## [STORY-XXX] Short title
**Status:** completed | blocked | partial
**Commit:** <hash>
**Files:** path/a.ts, path/b.tsx (max 5, "and N more" if >5)

**Summary:** 1-2 sentences on what was accomplished.

**Implemented:**
- Bullet 1 (max 8 words)
- Bullet 2
- Bullet 3 (max 5 bullets)

**Insights for next worker:**
- [Patterns discovered, gotchas, warnings, context]
```

---

## sprint-completion.md (Phase 4 Output)

```markdown
# Sprint: <name> -- Completion Summary

**Sprint Goal:** [From README]
**Completed:** [Date]

## Results

| Story | Title | Status | Commit |
|-------|-------|--------|--------|
| STORY-001 | [Title] | completed | abc1234 |
| STORY-002 | [Title] | completed | def5678 |

## Build Status
- TypeScript: PASS / FAIL
- Lint: PASS / FAIL
- Tests: PASS / FAIL ([N] passed, [N] failed)
- Build: PASS / FAIL

## Outstanding Issues
- [Any unresolved problems, partial completions, known bugs]

## Notes
- [Anything the verification phase needs to know]
```

---

## verification-report.md (Phase 5 Output)

```markdown
# Sprint: <name> -- Verification Report

**Verified by:** [Agent/tool]
**Date:** [Date]

## Test Results
- TypeScript: PASS / FAIL
- Lint: PASS / FAIL
- Tests: PASS / FAIL ([N] passed, [N] failed, [N] skipped)
- Build: PASS / FAIL

## Per-Story Verification

| Story | Title | Tests | Browser | Status |
|-------|-------|-------|---------|--------|
| STORY-001 | [Title] | PASS | PASS | verified |
| STORY-002 | [Title] | PASS | N/A | verified |

## Browser Verification Results

### /route/path
- [x] [Expected behavior] -- PASS
- [ ] [Expected behavior] -- FAIL: [description of failure]

### /another/route
- [x] [Expected behavior] -- PASS

## Evidence
> Link to video/GIF recordings captured during verification. One entry per verified route or interaction.

| Story | Route / Action | Recording | Notes |
|-------|---------------|-----------|-------|
| STORY-001 | `/route/path` | `evidence/story-001-route-path.gif` | Shows [behavior] working |
| STORY-002 | Form submit | `evidence/story-002-form-submit.mp4` | Confirms validation + success state |

- Store recordings in `sprint-dir/evidence/` alongside other sprint artifacts
- Naming convention: `story-NNN-description.{gif,mp4}`
- Only required for browser-verified stories; CLI-only stories can note "N/A -- CLI verified"

## Fixes Applied
- `path/to/file.ts` -- [What was fixed and why]
- `path/to/other.ts` -- [What was fixed and why]

## Outstanding Issues
- [Issues found but not fixed -- too large for verification phase]
- [Recommended for next sprint]

## Recommendation
**MERGE** / **NEEDS WORK**

[1-2 sentences explaining the recommendation]
```

---

## RETRO.md (Post-Sprint)

```markdown
# Sprint: <name> -- Retrospective

## What Worked
- [2-4 bullets]

## What Didn't Work
- [2-4 bullets]

## Changes for Next Sprint
- [2-4 concrete process changes]

## Follow-up Stories
- [Stories for next sprint]
```
