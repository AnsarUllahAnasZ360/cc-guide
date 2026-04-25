# Phase 4: Execution

Phase 4 implements the approved sprint. The lead acts as a master agent: it reads the sprint artifacts, maps dependencies, asks the user for concurrency and branch strategy, dispatches workers, integrates results, runs review and tests, writes the completion report, and creates one clean sprint commit.

The lead does not read the entire source tree or implement "quick fixes" unless the user explicitly changes the protocol. The lead keeps orchestration context clean and delegates code work.

## Prerequisites

- sprint `README.md`
- `stories/STORY-*.md`
- `verification-checklist.md`
- Phase 3 approval or explicit end-to-end authorization

## Outputs

- implemented code changes
- `progress.md`
- `sprint-completion.md`
- one sprint commit by default

## Startup Workflow

1. Read the sprint folder path supplied by the user. Accept either `sprints/<name>` or an explicit folder path. Do not assume a parent planning layout.
2. Read `README.md`, all stories, `verification-checklist.md`, and existing `progress.md` if present.
3. Inspect `git status --short --branch`.
4. Ask the user for branch strategy:
   - stay on current branch
   - create/switch to `sprint/<sprint-name>`
   - use another branch name
5. Ask the user for execution concurrency:
   - 1 story at a time
   - 2 stories at a time
   - 3 stories at a time
   - 4 stories at a time
6. Build the execution dependency map.
7. Create the lead task list.
8. Initialize or update `progress.md`.

If the user already gave branch or concurrency instructions, use them and document them in `progress.md`.

## Concurrency Rules

The user's requested concurrency is the maximum, not a command to ignore dependency risk.

Use fewer active workers when:

- stories touch the same files
- migrations or generated artifacts are involved
- one story produces types/contracts another story consumes
- the sprint is security-sensitive
- the codebase has unrelated dirty changes
- previous workers reported integration fragility

Use more active workers when:

- stories touch separate domains
- each story has clear tests
- dependencies are independent
- story writers gave clean file scopes
- the user accepts higher merge/conflict risk

Never exceed four active implementation stories unless the user explicitly overrides the protocol.

## Worker Dispatch Rules

Assign one story per worker by default. Batch only when stories are simple, related, and safe to implement together.

Worker prompt must include:

- sprint folder path
- story file path
- relevant README and plan paths
- `progress.md` path
- worker guide path
- required skills/tools from the story
- feature-level test plan from the story
- exact edit scope
- instruction to avoid broad source reading beyond the assigned story
- instruction not to create final commits unless told
- instruction to update `progress.md`

## Model Routing

Route by story difficulty:

- **Hard:** strongest available model, highest reasoning. Use for architecture, security, migrations, cross-system work, AI agents, and checkpoint/code-review stories.
- **Medium:** strong model with moderate reasoning. Use for multi-file implementation following known patterns.
- **Simple:** smaller or cheaper model is acceptable. Use for localized, mechanical, well-specified work.

If a worker gets blocked because the story is harder than expected, reassign or escalate to a stronger model rather than forcing the same path.

## Worker Lifecycle

For each story:

1. Mark story in progress in the lead task list.
2. Spawn the worker with the full story assignment.
3. Require the worker to load required skills before editing.
4. Require the worker to create its own task list.
5. Require targeted feature tests.
6. Require self-review.
7. Require `progress.md` update.
8. Worker returns status: completed, completed_with_concerns, needs_context, or blocked.
9. Lead integrates the result, reviews changed files at a high level, and decides next worker assignment.

Workers do not own final sprint completion. They own their story result.

## Worker Status Handling

Treat worker statuses as control signals:

- `completed`: send to review.
- `completed_with_concerns`: read concerns first; decide whether to review, reassign, or ask the user.
- `needs_context`: provide the missing context or decision before retrying.
- `blocked`: assess whether the story needs a stronger model, narrower scope, a different worker, or founder input.

Do not force the same worker to retry the same prompt after a real blocker. Something in the assignment, context, model route, or story shape must change.

## Testing During Execution

Workers run targeted tests for their story. They should not run the entire repository suite after every small change if that is slow and unrelated.

Each worker should run:

- tests it wrote or updated
- existing tests for the changed feature area
- typecheck/lint commands relevant to touched code if available
- any targeted command specified in the story

The lead runs broader sprint-level checks before commit:

- typecheck
- lint
- relevant full feature test suite
- build if applicable
- broader test suite when practical or when the sprint touches shared foundations

If broader tests fail for unrelated reasons, document the evidence. If they fail because of sprint changes, fix before commit.

## Code Review And Quality Closure

Before the sprint commit, run a quality closure pass. For large or risky sprints, this may be a dedicated quality closure story. For smaller sprints, the lead can spawn review teammates.

Required review dimensions:

- spec compliance against stories
- code quality
- security and permissions
- error handling
- type safety
- test coverage
- regressions in touched feature areas
- unrelated file changes

Separate spec compliance from code quality. A story can match the spec and still be poorly built; it can also be well built but miss a requirement.

Review order:

1. spec compliance review
2. fix gaps if any
3. code quality review
4. fix quality issues if any
5. rerun affected targeted tests

Do not move to the final sprint commit while either review has unresolved blocking findings.

## Sprint Commit Policy

Default: one sprint commit.

The lead creates the commit after:

- all stories are completed or explicitly deferred
- quality closure is complete
- targeted tests pass
- sprint-level checks are run or documented
- `progress.md` is complete
- `sprint-completion.md` is written
- unrelated files are not staged

Commit message format:

```text
[SPRINT] <sprint-name> - <summary>

- Delivered <feature/result>
- Updated <tests/completion artifacts>
- Documented <completion/verification handoff>
```

If the user asks for per-story commits, document the deviation in `progress.md` and `sprint-completion.md`.

## sprint-completion.md Requirements

The completion report answers: what was planned, what was delivered, what tests ran, what is left, and what Phase 5 should verify if the user runs the explicit QA mode.

It must include:

- sprint goal
- branch used
- concurrency used
- stories completed, partial, blocked, deferred
- files or feature areas changed
- tests run and results
- quality review summary
- known issues
- commit hash if commit already exists
- verification handoff

## Failure Handling

If a worker is blocked:

- read the blocker
- inspect only the minimum needed to understand scope
- provide guidance or reassign
- update `progress.md`
- do not silently mark complete

If three or more workers hit the same blocker pattern, stop and report to the user.

If conflicts occur:

- pause new worker dispatch
- integrate completed work
- resolve safely
- lower concurrency for remaining stories

## Lead Completion Report To User

When Phase 4 finishes, report:

- what was delivered
- branch used
- concurrency used
- sprint commit hash
- tests run
- unresolved issues
- readiness for Phase 5 verification
