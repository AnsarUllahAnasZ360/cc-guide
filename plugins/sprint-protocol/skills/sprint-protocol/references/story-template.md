# Story Template

Use this structure for every `stories/STORY-NNN.md` file.

A story is a coherent feature, fix, foundation, quality closure, or checkpoint unit. It must be clear enough for a worker to research, implement, test, self-review, and report without guessing.

```markdown
# STORY-NNN: <verb-first title>

**Status:** pending
**Story Type:** feature | foundation | fix | quality-closure | checkpoint
**Difficulty:** hard | medium | simple
**Recommended Model Route:** <best model/high reasoning | strong model/medium reasoning | smaller model acceptable>
**Dependencies:** STORY-XXX or none
**Expected Concurrency Safety:** safe parallel | sequence after dependency | isolate due to shared files

## Overview
<1-3 sentences describing the concrete deliverable.>

## Purpose
What are we building or fixing, and why does it matter to the user, operator, founder, or product workflow?

## Current State
- `path/to/file.ts:line` - relevant existing behavior
- `path/to/test.ts:line` - existing test pattern

State whether each reference is verified or inferred.

## Problem To Solve
What is missing, broken, risky, or incomplete today?

## Solution Direction
Describe the intended direction and the reasoning behind it. This is guidance, not a blind patch recipe.

> Note to implementing worker: verify this approach against the current code before editing. If the codebase shows a better pattern, use it and document the deviation in `progress.md`.

## Required Skills And Tools
- `<skill/tool>` - why it must be used
- `<skill/tool>` - why it must be used

If a required skill is not installed, discover the current equivalent with skill/tool search. If no equivalent exists, document the fallback pattern in `progress.md`.

## Research Items
- Read `path/to/file.ts` for <reason>.
- Trace `path/to/entry.ts` to understand <flow>.
- Check tests under `path/to/tests` for <pattern>.

## Implementation Tasks
- [ ] Research the referenced files and refine the implementation plan.
      Done when: deviations from this story are documented in `progress.md`.
- [ ] <Substantial implementation task>.
      Context: <why it exists and what it connects to>.
      Done when: <specific mini acceptance criteria>.
- [ ] <Substantial implementation task>.
      Context: <why it exists and what it connects to>.
      Done when: <specific mini acceptance criteria>.
- [ ] Write or update feature-level tests for <specific behavior>.
- [ ] Run the targeted tests listed below and fix failures caused by this story.
- [ ] Run targeted typecheck/lint commands where available.
- [ ] Self-review for error handling, edge cases, security, type safety, performance, and acceptance criteria.
- [ ] Append a `progress.md` entry with files changed, checks run, deviations, and insights.

## Feature-Level Test Plan

### Red/Green Strategy
- First failing test or existing failing behavior to prove: <test/command and expected failure>
- Minimal pass condition: <what passing proves>
- Refactor check: <what to rerun after cleanup>

### Tests To Write Or Update
- `path/to/test-file` - covers <behavior/acceptance criterion>
- `path/to/test-file` - covers <edge case>

### Targeted Commands
- `<command>` - expected: <pass condition>
- `<command>` - expected: <pass condition>

### Broader Checks For Lead
- `<command>` - why the lead should run it before sprint commit

## Acceptance Criteria

### Functional
- [ ] <User-visible behavior> works because <why it matters>.
- [ ] <Error or empty state> behaves correctly because <why it matters>.

### Technical
- [ ] Feature-level tests cover the changed behavior.
- [ ] Targeted checks pass or unrelated failures are documented with evidence.
- [ ] No unrelated files are changed.
- [ ] Required skills/tools were used or a fallback was documented.

## Definition Of Done
- [ ] Implementation is complete for this story's scope.
- [ ] Feature-level tests pass.
- [ ] Required skill/tool guidance was followed.
- [ ] Self-review is complete.
- [ ] `progress.md` is updated.
- [ ] Story is ready for lead review.

## Verification Handoff
What Phase 5 or a checkpoint sprint must verify:
- browser/API flow
- expected visible result
- evidence Phase 5 should capture if QA is requested
- data or credential assumptions

## Codebase References
- `path/to/file.ts:line` - why it matters
- `path/to/test.ts:line` - test pattern to follow

## Notes And Non-Goals
- <edge cases>
- <things not to do>
- <follow-up work>
```

## Difficulty Guidance

Use **hard** when the story involves architecture, security, permissions, migrations, cross-system integration, AI agents, concurrency, high-risk data changes, or ambiguous product behavior.

Use **medium** when the story touches multiple files and integration points but follows known local patterns.

Use **simple** when the story is localized, mechanical, and low-risk.

Do not mark a story simple if failure would block multiple later stories.

## Quality Closure Story Additions

For `Story Type: quality-closure`, include:

- code review scope
- feature test suite consolidation
- security and permission review
- bug fix boundaries
- final targeted commands

Quality closure stories should improve confidence in the sprint, not add new product scope.

## Checkpoint Story Additions

For `Story Type: checkpoint`, include:

- previous sprint folders covered
- README, completion reports, verification checklists, and any existing verification reports to read
- browser workflows to test with the platform browser tool
- integration risks to inspect
- regression commands
- fix boundaries
- evidence expectations if Phase 5 QA is requested

Checkpoint stories are verification and integration work. They should not introduce new features unless the checkpoint explicitly identifies a bounded repair needed to continue the larger initiative.
