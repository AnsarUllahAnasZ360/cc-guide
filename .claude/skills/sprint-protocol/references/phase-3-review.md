# Phase 3: Review And Audit

Phase 3 is the approval and quality gate before implementation. Its purpose is to make sure the story set matches founder intent, is correctly ordered, has the right skills and tests, and can be executed without workers guessing.

This is not a rubber stamp. This is where bad sprint design should be caught.

## Prerequisites

- sprint `README.md`
- `stories/STORY-*.md`
- `research.md` and `plan.md`
- multi-sprint context in `plan.md` if the sprint belongs to a larger initiative

For checkpoint sprints, also require the prior sprint README files, completion reports, verification checklists, and any verification reports that already exist.

## Outputs

- updated story files if needed
- `verification-checklist.md`
- optional `review-notes.md` if there were important founder decisions or tradeoffs

## Lead Workflow

1. Read the sprint README and every story.
2. Build a task list for founder review, story audit, dependency audit, skills audit, testing audit, and verification checklist creation.
3. Present a founder-level summary: what will be built, why it matters, story order, dependency chain, tests, difficulty, and risks.
4. Capture user feedback and classify every item.
5. Spawn revision teammates for story changes where needed.
6. Spawn audit teammates for story quality, testability, dependency mapping, and skill routing.
7. Ensure the story set is still feature-driven and not artificially packed or split.
8. Create `verification-checklist.md`.
9. Ask for explicit approval before Phase 4 unless the user already authorized end-to-end execution.

## Founder Feedback Rules

Every feedback item must be handled visibly:

- **Addressed:** story or plan changed now.
- **Acknowledged:** story already covers it or execution guidance is updated.
- **Deferred:** excluded with clear reason and follow-up location.
- **Questioned:** needs founder decision because it changes scope, risk, or sequencing.

Do not silently absorb feedback. The founder needs to see that the sprint still reflects the vision.

## Audit Dimensions

### Intent Alignment

- Does the sprint solve the actual business/product problem?
- Did story writing preserve the founder's priorities?
- Are non-goals still excluded?
- Is anything important missing from the supplied research or requirements?

### Sprint Shape

- Does this sprint deliver one or more concrete features or a legitimate checkpoint?
- Is the story count justified by the work?
- Are stories feature-driven rather than layer-driven?
- Are dependencies clear and ordered?
- Are risky stories early enough to fail fast?

### Skill Routing

- Does every story have a Required Skills And Tools section?
- Are frontend stories routed to frontend/design/framework skills?
- Are backend stories routed to data/API/auth/database skills?
- Are AI-agent stories routed to AI SDK, AI Elements, LiveKit, Deep Agents, memory, orchestration, eval, or observability skills as relevant?
- Are verification stories routed to the platform browser tool or other verification tools?
- Is there a fallback when a skill is not installed?

### Testing Strategy

- Does every story include feature-level tests?
- Are targeted commands specific enough for a worker to run?
- Are full-suite or broader sprint checks assigned to the lead or quality closure story?
- Are browser checks deferred to Phase 5 or checkpoint stories, not hidden inside normal implementation?
- Is completion verifiable without relying on belief?

### Difficulty And Model Routing

- Is every story marked hard, medium, or simple?
- Does model guidance match the actual risk?
- Are hard foundation stories assigned the strongest model?
- Are simple mechanical stories allowed to use cheaper models?
- Are checkpoint and security-sensitive stories treated as hard by default unless proven otherwise?

### Commit And Branch Strategy

- Does the sprint say whether it should use the current branch or a sprint branch?
- Is the default one sprint commit clear?
- Are workers instructed not to create story commits unless the strategy changes?
- Is traceability preserved through `progress.md`, `sprint-completion.md`, and the final commit body?

## Verification Checklist Requirements

`verification-checklist.md` must include:

- sprint goal
- source artifacts read
- global checks the lead should run before final commit
- targeted feature checks from each story
- per-story expected test commands
- browser/API flows for user-visible behavior
- code review expectations
- evidence expectations for explicit Phase 5 verification
- data, credential, or seed requirements
- checkpoint handoff notes if applicable

For checkpoint sprints, include:

- previous sprints covered
- reports and checklists to read
- integration flows to test
- code review areas
- browser flows
- regression tests
- release-readiness checks

## Review Teammate Prompt Shape

```text
You are a sprint review teammate for <sprint-folder>.

Review area:
- <story quality | skill routing | test strategy | dependency map | checkpoint readiness>

Read first:
- README.md
- all stories
- research.md
- plan.md
- multi-sprint context from `plan.md` if present
- story template

Audit for:
- founder intent alignment
- missing or vague acceptance criteria
- required skills/tools
- feature-level tests
- difficulty and model routing
- dependencies and execution order
- branch/commit assumptions
- verification readiness

Rules:
- Do not implement product code.
- Do not edit unless specifically assigned a revision.
- Include exact story paths and section names.

Return:
- pass/fail by dimension
- required revisions
- recommended but optional improvements
- risk notes for Phase 4
```

## Approval Gate

Before Phase 4, report:

- sprint objective
- story list and difficulty
- required skills by story
- targeted tests by story
- dependency order
- recommended execution concurrency
- branch/commit recommendation
- verification plan
- unresolved decisions

Ask: "Approve this sprint for execution?"

Do not start execution without approval unless the user's original instruction explicitly authorized full end-to-end delivery.
