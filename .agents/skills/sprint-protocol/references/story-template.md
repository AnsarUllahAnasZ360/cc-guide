# Story Template

Use this exact structure for `sprints/<name>/stories/STORY-NNN.md`.

```markdown
# STORY-NNN: <verb-first title>

**Status:** pending
**Tier:** simple | complex
**Estimated scope:** <files>, <lines>, <agent time>
**Dependencies:** STORY-XXX or none

## Overview
<1-3 sentences describing the deployable slice.>

## Problem
What is broken, missing, or needed? Why does it matter?

### Current State
- `path/to/file.ts:line` - relevant current behavior
- `path/to/test.ts:line` - existing test pattern

## Solution Approach
Describe the recommended direction, not a rigid patch.

> Note to implementing agent: verify this approach against the current code before editing. If the codebase shows a better pattern, use it and explain the deviation in `progress.md`.

## Research Items
- Read `path/to/file.ts` for <reason>
- Trace `path/to/entry.ts` to <reason>
- Check tests under `path/to/tests` for <reason>

## Required Skills And Tools
- <skill/tool name> - <why it applies>

## Tasks
- [ ] Research the referenced files and refine the implementation plan.
      Done when: deviations from this story are documented in `progress.md`.
- [ ] <Substantial implementation task>.
      Context: <why it exists and what it connects to>.
      Done when: <specific mini acceptance criteria>.
- [ ] <Substantial implementation task>.
      Context: <why it exists and what it connects to>.
      Done when: <specific mini acceptance criteria>.
- [ ] Write or update unit tests for <specific behavior>.
- [ ] Run typecheck and lint; fix all errors caused by this story.
- [ ] Run the relevant test suite; fix failures caused by this story.
- [ ] Run a code self-review for error handling, edge cases, type safety, security, and performance.
- [ ] Append a `progress.md` entry with commit hash, files changed, summary, and insights.

## Acceptance Criteria

### Functional
- [ ] <User-visible behavior> works because <why it matters>.
- [ ] <Error or empty state> behaves correctly because <why it matters>.

### Technical
- [ ] Tests cover the changed behavior.
- [ ] Typecheck passes or unrelated failures are documented.
- [ ] Lint passes or unrelated failures are documented.
- [ ] No unrelated files are changed.

## Codebase References
- `path/to/file.ts:line` - <why it matters>
- `path/to/test.ts:line` - <test pattern to follow>

## Notes
- <edge cases>
- <things not to do>
- <follow-up work>
```

## Sizing Rules

- 4-8 stories per normal sprint.
- 10-30 files per story when possible.
- 500-2000 changed lines per story when possible.
- 5-12 substantial tasks.
- Tests ship inside the feature story.
- Browser verification belongs in Phase 5, not Phase 4.

Split only when the combined work exceeds the story limits, has hard deployment dependencies, or spans unrelated domains.
