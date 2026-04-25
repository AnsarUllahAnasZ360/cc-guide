# Phase 1: Research And Planning

Phase 1 decides what should be built, whether the scope fits into one sprint, and what independent sprint structure should exist before story writing begins.

This phase has two valid starting points:

- **Raw intake:** the founder gives thoughts, goals, complaints, screenshots, or loose requirements.
- **Baked packet:** the founder already has `Research.md`, `Plan.md`, `Spec.md`, `System-Design.md`, `Requirements.md`, a PRD, an architecture packet, or a prior chat summary.

Do not treat these paths the same. Raw intake needs discovery. A baked packet needs review, gap analysis, sizing, and sprint distribution.

## Outputs

For a single sprint:

- `sprints/<sprint-name>/research.md`
- `sprints/<sprint-name>/plan.md`

For multi-sprint work:

- a user-facing multi-sprint distribution summary
- approved independent sprint folders such as `sprints/<initiative>-01-<feature-name>/`
- each sprint folder gets its own `research.md` and `plan.md`

Only create full sprint folders after the sprint distribution is approved, unless the user explicitly asks you to proceed without a review gate. Do not create a separate epic artifact hierarchy by default.

## Lead Role

The lead is an executive planner. The lead does not swallow the whole codebase into context. The lead coordinates research teammates, reviews source packets, asks focused questions, and turns the result into either one sprint plan or a multi-sprint distribution.

The lead owns:

- founder-intent capture
- scope and non-goals
- one-sprint vs multi-sprint decision
- feature-driven sprint sequence
- checkpoint sprint placement
- approval gate before mass folder creation

## Workflow

### 1. Identify Intake Mode

Determine whether the user is giving a raw idea or a baked packet.

If raw:

- ask only for missing information that changes scope, acceptance, or safety
- identify research topics
- spawn researchers

If baked:

- read every provided artifact fully
- identify inconsistencies, duplicated ideas, missing decisions, untestable claims, and hidden dependencies
- ask focused questions only where the packet cannot be converted safely into sprint work

Always capture:

- objective
- target users or operators
- in scope
- out of scope
- success criteria
- known constraints
- source documents used

### 2. Create The Planning Task List

Create lead tasks for:

- intake mode classification
- source artifact review
- gap and inconsistency review
- one-sprint vs multi-sprint sizing
- sprint distribution
- checkpoint strategy
- founder approval
- artifact creation

### 3. Research Or Review With Teammates

For raw intake, spawn one researcher per independent domain.

For baked packets, spawn review teammates by concern:

- product-scope reviewer
- architecture reviewer
- dependency reviewer
- testing and verification reviewer
- implementation sequencing reviewer

Review teammates should return facts separately from inferences. They should not write sprint folders until the lead approves the distribution.

### 4. Decide One Sprint Versus Multi-Sprint Work

Use these questions:

- Can the proposed work ship as one coherent feature set?
- Can it be implemented and verified without too many unrelated domains in one run?
- Are there hard ordering dependencies?
- Would running the whole thing as one sprint create excessive conflict risk?
- Does the verification work require a dedicated checkpoint?
- Would a founder reasonably expect a usable milestone after each sprint?

If the answer is one sprint, produce `research.md` and `plan.md` in the sprint folder.

If the answer is multiple sprints, present a multi-sprint distribution first. Do not pretend a large initiative is one sprint just because the user supplied one plan file.

### 5. Build Feature-Driven Sprint Distribution

Every implementation sprint should deliver one or more concrete features, fixes, or foundations that are useful to later work.

Each sprint in the distribution must include:

- sprint name
- business/product outcome
- concrete feature deliverables
- dependency position
- difficulty: hard, medium, or simple
- likely required skills/tools
- targeted feature test strategy
- verification surface
- expected branch/commit strategy
- whether a checkpoint should follow it

Order sprints so the work compounds:

1. foundations that unblock later features
2. core user-facing capability
3. integrations and workflow polish
4. hardening and reliability
5. checkpoint verification after meaningful groups of work

### 6. Plan Checkpoint Sprints

Use checkpoint sprints when an initiative has multiple implementation sprints or when several changes must be integrated before the next major stage.

A checkpoint sprint should:

- read the previous sprint `README.md`, `sprint-completion.md`, and `verification-checklist.md`
- read previous `verification-report.md` files when they exist
- run code review across the delivered work
- run targeted and broader test suites
- start the app and perform browser verification through the platform browser tool: Agent Browser CLI in Claude/Cloud Code, Browser Use in Codex
- fix sprint-caused failures when bounded
- document outstanding issues and alignment gaps

Common cadence:

- after 2-4 risky foundation sprints
- after 5-10 normal implementation sprints
- before a release or demo milestone
- before starting a new architectural layer

Do not create checkpoint sprints as ceremony. Create them when integration risk, user-visible workflow risk, or release confidence requires them.

### 7. Produce Artifacts

#### Single Sprint

Create:

- `research.md`: what was investigated or reviewed, with source references
- `plan.md`: sprint goal, scope, stories proposed at a high level, required skills, tests, risk, branch/commit strategy

#### Multi-Sprint Work

Create independent sprint folders after approval. Each sprint folder should be ready for Phase 2 later without requiring the original chat.

Each sprint folder gets:

- `research.md`: the source packet review relevant to that sprint, including gaps, assumptions, and dependency context
- `plan.md`: sprint goal, scope, dependencies, likely stories, required skills, targeted tests, verification checklist seed, branch/commit assumptions

Do not create separate portfolio-level planning artifacts by default:

- intake review
- roadmap
- checkpoint plan
- decisions bundle

If the user asks for a durable overview of the whole distribution, create a lightweight `sprints/<initiative>-distribution.md`. Treat it as a planning aid, not as a runtime artifact required by later phases.

### 8. Approval Gate

If the scope fits one sprint, ask whether to proceed to story writing unless the user already asked for end-to-end execution.

If it needs multiple sprints, present:

- total number of implementation sprints
- checkpoint sprint placement
- why the work cannot fit one sprint
- what each sprint delivers
- what tradeoffs the distribution makes

Wait for approval before creating all sprint folders, unless the user explicitly requested autonomous creation.

## Research Teammate Prompt Shape

Use this for raw codebase discovery:

```text
You are a research teammate for Sprint or multi-sprint initiative <name>.

Topic: <topic>

Read first:
- relevant project guidance
- files likely to define this feature area
- tests and adjacent patterns

Investigate:
- current implementation and data flow
- existing patterns
- dependencies and call chains
- tests
- risks, permissions, migrations, and edge cases

Rules:
- Do not edit files.
- Do not create scratch files.
- Separate verified facts from inferences.
- Include exact file paths and line numbers.

Return:
Current state:
Evidence:
Patterns:
Gaps:
Risks:
Implications for sprint planning:
```

## Baked Packet Reviewer Prompt Shape

Use this when the founder supplies existing planning material:

```text
You are a planning reviewer for Sprint or multi-sprint initiative <name>.

Source packet:
- <paths or pasted docs>

Review for:
- contradictions
- missing acceptance criteria
- missing data or auth decisions
- dependencies between features
- scope that is too large for one sprint
- testability gaps
- unclear browser/API verification
- opportunities to split into feature-driven sprints

Rules:
- Do not edit files.
- Do not invent requirements.
- Separate facts from recommendations.

Return:
Summary:
Inconsistencies:
Gaps:
One sprint or multi-sprint recommendation:
Recommended sprint distribution:
Questions for founder:
```

## Single Sprint Plan Requirements

`plan.md` must include:

- sprint goal
- source inputs reviewed
- in scope and out of scope
- why the work fits one sprint
- proposed story set, without forcing a fixed count
- feature-driven order and dependencies
- required skills/tools by story area
- targeted test strategy
- browser/API verification strategy
- risk and rollback notes
- difficulty level and model-routing recommendation
- branch and commit assumptions

## Multi-Sprint Distribution Requirements

The multi-sprint distribution summary must include:

- initiative goal
- source inputs reviewed
- why the work does not fit one sprint
- sprint sequence table
- per-sprint feature deliverables
- dependencies and logical order
- checkpoint sprints and why they exist
- expected completion and verification handoff for every sprint
- recommended branch strategy
- high-risk decisions requiring founder approval
