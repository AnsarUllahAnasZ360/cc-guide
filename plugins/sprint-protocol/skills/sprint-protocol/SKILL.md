---
name: sprint-protocol
description: Codex-native sprint protocol for large feature or product work. Use when the user asks to plan a sprint, research a sprint, write sprint stories, review stories, execute a sprint, verify a sprint, run a multi-agent implementation, or manage end-to-end delivery from requirements to PR. Includes phases for research, planning, stories, review, execution, verification, and merge handoff.
---

# Sprint Protocol

Use this skill as the orchestrator for long-running Codex sprints. The protocol turns a broad goal into durable artifacts under `sprints/<name>/`, delegates work to Codex subagents, and keeps the run resumable after compaction or interruption.

## Core Invariants

1. **Plan first.** Start every phase with `update_plan`; keep exactly one step `in_progress`.
2. **Files are memory.** Durable state lives in sprint artifacts, not chat memory. Read the sprint README, `state.md`, and `progress.md` before resuming.
3. **Delegate broad work.** Use `spawn_agent` for codebase research, audits, implementation, and verification shards. The lead may inspect artifacts and perform light sanity checks, but should not absorb a huge codebase into the root context.
4. **Pack stories vertically.** Prefer 4-8 stories, with 12-15 as a large-sprint maximum. A story is a deployable slice, not one file, one endpoint, or one test task.
5. **Verify with proof.** Phase 5 must run project checks and user-visible verification. When available, invoke verification skills/plugins such as ProofOps, GitHub review, Vercel browser verification, Agent Browser, or framework diagnostics.

## Phase Map

| Phase | User intent | Codex skill | Main output |
| --- | --- | --- | --- |
| 1 | research, plan, scope | `sprint-research` | `research.md`, `plan.md`, `state.md` |
| 2 | write stories | `sprint-stories` | `stories/STORY-NNN.md`, `README.md` |
| 3 | review stories, audit plan | `sprint-review` | updated stories, `verification-checklist.md` |
| 4 | execute sprint, implement | `sprint-execute` | code, commits, `progress.md`, `sprint-completion.md` |
| 5 | verify sprint, prove, PR | `sprint-verify` | fixes, evidence, `verification-report.md`, PR |

When the user asks for the whole sprint end to end, run phases sequentially and pause only at approval gates or true blockers.

## Codex Command Equivalents

Codex plugins do not need slash commands. This plugin exposes phase skills that trigger from natural language:

- `sprint-research`: "research this and create the sprint plan"
- `sprint-stories`: "write stories for sprint <name>"
- `sprint-review`: "review/audit these stories"
- `sprint-execute`: "execute sprint <name>"
- `sprint-verify`: "verify sprint <name>"

If the user invokes a legacy slash phrase such as `/sprint-execute`, treat it as the matching phase skill.

## Artifact Layout

Create sprint artifacts at the repository root:

```text
sprints/<name>/
  state.md
  research.md
  plan.md
  README.md
  stories/
    STORY-001.md
  verification-checklist.md
  progress.md
  sprint-completion.md
  verification-report.md
  evidence/
```

Use `state.md` as the lead-owned orchestration ledger: phase status, active agents, queue order, blockers, and resume instructions. Use `progress.md` as the append-only worker ledger.

## Load References

Read only what the current phase needs:

- Codex orchestration rules: `references/codex-orchestration.md`
- Phase 1: `references/phase-1-research.md`
- Phase 2: `references/phase-2-stories.md`
- Phase 3: `references/phase-3-review.md`
- Phase 4: `references/phase-4-execution.md`
- Phase 5: `references/phase-5-verification.md`
- Worker prompts and rules: `references/worker-guide.md`
- Story format: `references/story-template.md`
- Artifact templates: `references/templates.md`

Run the sprint doctor whenever entering or resuming a phase:

```bash
node plugins/sprint-protocol/scripts/sprint-doctor.mjs <sprint-name>
```

Use `--json` when an agent or script needs structured state.

## Long-Running Runs

For work likely to outlast the current interaction:

- Keep `state.md` current before and after every batch of subagents.
- Use `update_plan` for the immediate phase queue.
- Use `automation_update` to create a thread heartbeat only when the user asks to keep checking or continue later.
- Close subagents with `close_agent` after their result has been integrated.
- Do not leave live agents running when ending the turn.

## Stop Conditions

Stop and ask the user when:

- Scope or acceptance criteria are not testable.
- A requested phase is missing prerequisite artifacts.
- Three or more independent agents report the same blocker.
- Verification requires credentials, data, or services the repo does not provide.
- Proceeding would overwrite unrelated user changes.

Otherwise, make reasonable assumptions, document them in `state.md`, and keep going.
