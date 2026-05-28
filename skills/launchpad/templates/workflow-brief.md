# Template — Workflow Brief

> The output when the mode is workflow (many agents, parallel phases, cross-checking). In Claude Code this drives **Dynamic Workflows**; in Antigravity, the Agent Manager's async sub-agents; in Codex, approximate with parallel threads/worktrees (no native workflow primitive).

## The shape

```
Workflow: <name> — <one-line outcome>.
Trigger (Claude Code): include the word "workflow" in the prompt, or set /effort ultracode.

## Phases (each phase = a fan-out of parallel agents, then a synthesis)

### Phase 1 — <name> (parallel: N agents)
- Each agent: <bounded, identical-shape task over a different slice>.
- Returns: <the structured result each agent hands back>.
- Synthesis: <how the results combine before the next phase>.

### Phase 2 — <name>
- Depends on Phase 1 output. <...>

### Phase 3 — Cross-check / reconcile
- <independent verification of the combined result>.

## Definition of Done
- <the verification surface for the whole workflow>.

## Boundaries & safety
- Parallelize only independent slices. Shared single-instance resources (one DB/server, a restart-on-edit process) → serialize that step.
- Each agent gets isolated context + a bounded slice; the orchestration script holds the plan, not any one agent.
```

## When to use vs a goal
- Use a workflow when the work is WIDE (hundreds of files / many independent investigations) and a single looping thread would bottleneck.
- If the phases are actually sequential and single-threaded, author a goal instead (`../reference/mode-decision.md`).

## Notes per CLI
- **Claude Code:** Dynamic Workflows runs the script deterministically with 16-1000 background agents; intermediate results live in script variables, not the conversation. The bundled `/deep-research` is a ready example.
- **Antigravity:** the orchestrator spawns async sub-agents with isolated context; steer via Artifact comments; verify via the browser sub-agent.
- **Codex:** no native workflow — split into parallel threads / git worktrees and reconcile manually; do not author in-goal sub-agents.
