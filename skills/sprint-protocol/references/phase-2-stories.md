# Phase 2: Story Writing

Phase 2 turns an approved sprint plan into executable worker stories. A story is not a file, endpoint, component, or isolated test task. A story is a coherent piece of feature delivery that a worker can research, implement, test, review, and hand back.

Do not force a fixed story count. The story count should come from the feature requirements, dependency map, risk, testing boundaries, and expected worker scope.

## Prerequisites

For a normal sprint:

- `research.md`
- `plan.md`

For a checkpoint sprint:

- checkpoint `research.md` and `plan.md`
- previous sprint `README.md` files
- previous sprint `sprint-completion.md` files
- previous sprint `verification-checklist.md` files
- previous sprint `verification-report.md` files when they exist

If prerequisite artifacts are missing, stop and run Phase 1 or ask the user for the missing source folder.

## Outputs

- `README.md`
- `stories/STORY-NNN.md`
- updated planning notes if story writing discovers scope problems

## Lead Workflow

1. Read the sprint folder, `research.md`, `plan.md`, and any multi-sprint context embedded in the plan.
2. Create a task list for story extraction, writer batches, skill routing, test strategy review, and final audit.
3. Build a dependency map before assigning writers.
4. Decide the story set from the feature boundaries. Do not start from a target number.
5. Spawn story writers in bounded batches. Two writers at a time is a normal default, but reduce to one if the stories are tightly coupled.
6. Require each writer to perform targeted codebase research before writing.
7. Audit every story against `story-template.md`.
8. Ensure every story includes mandatory Required Skills And Tools and Feature-Level Test Plan sections.
9. Write the sprint `README.md`.
10. Report story count, dependency order, difficulty distribution, required skills, testing strategy, and any recommended checkpoint.

## Story Count Guidance

Use enough stories to make execution reliable, but not so many that coordination dominates the work.

Split into separate stories when:

- two pieces can be implemented and tested independently
- one piece is hard and another is simple
- separate domains would create unnecessary worker confusion
- a dependency must land before later work can be safely attempted
- test strategy differs meaningfully between pieces

Keep work together when:

- schema, backend, UI, and tests are all part of one user-visible feature
- the same files and concepts would be touched by multiple thin stories
- tests are the only reason for a separate story
- several bugs belong to the same workflow or component family
- splitting would create a non-functional intermediate state

If a sprint has many stories, explain why. If a sprint has only one story, explain why that is safe and testable.

## Required Story Sections

Every story must include:

- overview
- problem and current state
- purpose and user/business impact
- solution approach
- research items
- required skills and tools
- difficulty and model-routing guidance
- implementation tasks
- feature-level test plan
- acceptance criteria
- definition of done
- verification handoff
- codebase references
- notes and non-goals

The **Required Skills And Tools** section is mandatory. It should not be generic. It must tell the worker what to load or discover before implementation.

The **Feature-Level Test Plan** section is mandatory. It must identify the tests the worker should write or update for that story and the exact targeted commands to run where known.

## Skill Routing Examples

Story writers should choose required skills by stack and task type:

| Work type | Skills/tools to consider |
| --- | --- |
| Frontend UI | frontend design, React best practices, Next.js best practices, shadcn/ui, accessibility, visual/browser verification, project design system |
| Backend API/data | Supabase, Convex, Laravel, FastAPI, database migration, auth/permissions, queues, API testing |
| AI agents | AI SDK, AI Elements, LiveKit agents, LangGraph/Deep Agents, memory, orchestration, tool-calling, evals, observability |
| Verification | Agent Browser CLI in Claude/Cloud Code, Browser Use in Codex, code review skill, security review, framework diagnostics, test runner docs |
| Release/PR | GitHub/PR skill, CI diagnostics, changelog/release notes if relevant |

If the exact skill is unknown, write a discovery instruction:

```text
Use ToolSearch or the platform skill discovery mechanism to locate the current <domain> skill before editing. If no skill exists, follow the project-local patterns in <file/path> and document the fallback in progress.md.
```

## Testing Requirements

Every story must define a dedicated testing system for its own work:

- the first failing test or existing failing behavior that proves the change is needed, where practical
- new or updated unit tests for the changed behavior
- integration/API tests where the feature crosses boundaries
- component tests where UI state and behavior matter
- targeted command(s) for the story's feature area
- expected output or pass condition
- what broader checks should be run before sprint completion

Do not require the full repository test suite for every worker if it is too slow or unrelated. Workers run targeted checks for their feature area. The lead runs broader sprint-level checks before the sprint commit and again in verification.

## Quality Closure Story

For larger, risky, or multi-story sprints, consider adding a dedicated quality closure story. This is not a replacement for Phase 5. It is implementation-phase hardening.

Use a quality closure story when:

- multiple workers touch shared surfaces
- there is meaningful security/auth risk
- generated code or migrations need review
- the sprint changes a critical workflow
- the feature-specific test suite needs consolidation

A quality closure story may include:

- code review of sprint changes so far
- feature-level test suite consolidation
- targeted bug fixes found during review
- security and permission checks
- performance or accessibility checks where relevant

It must still be scoped. Do not turn it into an uncontrolled refactor.

## Checkpoint Sprint Stories

Checkpoint sprints are story-written like normal sprints, but their stories focus on integration confidence.

Common checkpoint story types:

- cross-sprint code review and bug triage
- browser workflow verification through the platform browser tool
- regression testing for core routes or flows
- integration repair for features shipped across previous sprints
- release-readiness documentation

Checkpoint stories must read prior sprint `README.md`, `sprint-completion.md`, and `verification-checklist.md` files. They should also read `verification-report.md` files when those reports already exist. They should not re-litigate the original plan; they should verify what was planned, what was delivered, what still needs to hold together, and whether a dedicated verification report needs to be created now.

## Story Writer Prompt Shape

```text
You are a story writer for Sprint <sprint-folder>.

Assigned story area:
- <feature or quality area>

Read first:
- sprint research.md
- sprint plan.md
- multi-sprint context from `plan.md` if present
- story template
- relevant project guidance

Before writing:
- research the referenced code paths and nearby tests
- identify required skills/tools for the worker
- identify feature-level tests and targeted commands
- challenge whether this should be one story or split/merged

Write:
- sprints/.../stories/STORY-NNN.md

Rules:
- Do not implement product code.
- Do not create browser verification tasks inside normal implementation stories unless this is a checkpoint sprint.
- Include required skills/tools.
- Include a dedicated feature-level test plan.
- Include difficulty and model-routing guidance.
- Include definition of done.
- Keep tasks substantial and verifiable.

Return:
- story files written
- skill routing decisions
- testing decisions
- sizing concerns
- any scope or dependency issue found
```

## Story Audit Checklist

Reject or revise any story that:

- lacks required skills/tools
- lacks feature-level tests
- does not state definition of done
- has vague acceptance criteria
- splits tests away from implementation
- horizontally splits a single feature by layer
- instructs workers to do broad browser verification during a normal implementation story
- ignores dependencies from the sprint plan
- claims a file exists without marking it as verified or inferred
- is too broad for one worker or too thin to justify its own story
