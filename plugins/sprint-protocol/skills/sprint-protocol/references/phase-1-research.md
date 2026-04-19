# Phase 1: Research And Plan

Use when the user asks to research, plan, scope, or start a sprint.

## Outputs

- `sprints/<name>/state.md`
- `sprints/<name>/research.md`
- `sprints/<name>/plan.md`
- branch `sprint/<name>` unless the user asks otherwise

## Workflow

1. **Intake.** Convert the user request into a short objective, explicit scope, non-goals, and unknowns. Ask only if a missing answer would make the sprint unsafe or untestable.
2. **Initialize.** Create branch and sprint folder. If the branch exists, inspect status and continue instead of overwriting.
3. **Plan the phase.** Call `update_plan` with intake, research shards, synthesis, plan writing, validation, and commit steps.
4. **Run sprint doctor.** Use `node plugins/sprint-protocol/scripts/sprint-doctor.mjs <name> --json` after folder creation.
5. **Shard research.** Identify independent topics and spawn one `explorer` agent per topic.
6. **Synthesize research.** Merge reports into `research.md`. Every concrete claim should include file paths or clearly state it is an inference.
7. **Write plan.** Spawn a plan-writer agent or write it as lead after research synthesis. The plan must propose packed vertical stories and justify the count.
8. **Validate.** Check story count, dependencies, risk, and testability. If the sprint seems too large, split into waves.
9. **Commit artifacts.** Commit only sprint artifacts for Phase 1.
10. **Report.** Summarize the plan and ask whether to proceed to story writing when approval is needed.

## Research Agent Prompt Shape

```text
You are a read-only research agent for Sprint <name>.

Topic: <topic>

Read first:
- AGENTS.md or other repo guidance that applies
- package/config files needed to understand the stack
- the likely entry points for this topic

Investigate:
- current implementation and data flow
- nearby patterns and tests
- integration points and dependencies
- risks, TODOs, migrations, auth, permissions, and edge cases

Rules:
- Do not edit files.
- Do not create scratch files.
- Prefer exact file paths and line numbers.
- Separate verified facts from inferences.

Return:
## <topic>
Current state:
Files:
- path:line - finding
Patterns:
Gaps:
Risks:
Recommended story implications:
```

## Plan Requirements

`plan.md` must include:

- sprint goal
- in scope and out of scope
- proposed stories table
- story count justification
- story order and dependencies
- packing strategy
- risk and verification strategy
- expected commands for typecheck, lint, test, build

Target 4-8 stories. Use up to 12-15 only for large, cohesive work. If more are needed, create multiple sprints.
