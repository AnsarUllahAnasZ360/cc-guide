# Codex Orchestration Rules

Use this reference in every Sprint Protocol phase.

## Primitive Mapping

| Sprint need | Codex primitive | Notes |
| --- | --- | --- |
| Lead task list | `update_plan` | Keep it short and current. One `in_progress` item only. |
| Research shard | `spawn_agent` with `agent_type: explorer` | Read-only investigation, file paths, line numbers, findings. |
| Implementation shard | `spawn_agent` with `agent_type: worker` | Bounded code changes for one story or issue group. |
| Follow-up on active worker | `followup_task` | Use for blockers, corrections, or narrowed instructions. |
| Wait for reports | `wait_agent` | Poll and then read final agent outputs from mailbox updates. |
| Close completed agents | `close_agent` | Do this after integrating the result. |
| Large homogeneous CSV work | `spawn_agents_on_csv` | Use for read-only audits or story-writing shards, not risky overlapping code edits. |
| Discover external tools | `tool_search` | Prefer plugin tools/skills for GitHub, Vercel, browser, and verification flows. |
| Durable wakeup | `automation_update` heartbeat via `tool_search` | Only when the user wants continued monitoring or later follow-up. Discover the automation tool first. |

## Lead Role

The lead is the current Codex agent. It owns:

- user intake and approval gates
- `update_plan`
- sprint artifact structure
- subagent prompts and queue management
- synthesis across reports
- final user communication
- preserving unrelated dirty worktree state

The lead may inspect high-level repo files, scripts, and diffs when needed, but should delegate wide codebase reads and implementation to subagents. This keeps the lead context focused on orchestration.

## Subagent Roles

Use named, bounded agents:

- `research_<topic>`: explorer; read-only; reports current state, patterns, risks, tests, file references.
- `story_writer_<batch>`: worker or explorer; writes story files when asked; does not implement product code.
- `story_auditor_<batch>`: explorer; checks story quality, sizing, dependencies, and testability.
- `worker_story_###`: worker; implements exactly one story unless explicitly assigned a compatible batch.
- `verifier_<surface>`: explorer for read-only verification and review; worker only when fixing accepted issues.

Prompt every subagent with:

- sprint name and phase
- exact files to read first
- output schema or report format
- edit permissions and forbidden actions
- when to stop and report a blocker

## Model Routing

Use the available Codex agent roles instead of Claude model names:

- `explorer`: repo research, audits, review, verification planning.
- `worker`: bounded code edits, story-file creation, fix implementation.
- default agent: complex synthesis or cross-cutting tasks when no narrower role fits.

If the user asks for many agents, parallelize independent read-only work freely. For code edits, ask the user for execution concurrency during Phase 4: 1, 2, 3, or 4 active stories. Treat that number as a maximum, then reduce it when dependencies, conflicts, migrations, or dirty worktree state make parallel work unsafe.

## Durable State

The standard sprint memory surface is the sprint folder:

- `research.md` and `plan.md` define intent and sprint boundaries
- `README.md` and stories define execution
- `verification-checklist.md` defines what must be checked
- `progress.md` is the append-only implementation ledger
- `sprint-completion.md` records what was delivered and what QA should verify
- `verification-report.md` is created only by explicit Phase 5 verification

`progress.md` is append-only. Workers must read all relevant entries before editing and append one entry before completion.

If a run is exceptionally long, the lead may create an optional `orchestration-notes.md` for active queues, blockers, and resume instructions. Do not make it part of the required sprint artifact contract.

## Git Safety

- Inspect `git status --short --branch` before edits and before commits.
- Never revert unrelated user changes.
- Workers must stage specific files only.
- Default to one sprint commit after the lead has reviewed, tested, and written `sprint-completion.md`.
- Verification fixes may use one follow-up `[VERIFY]` commit when Phase 5 runs after the sprint commit.

## Compaction Recovery

After compaction or resume:

1. Read `plan.md`.
2. Read `README.md` if it exists.
3. Read all relevant entries in `progress.md` if Phase 4 or later.
4. Run the sprint doctor:
   - repo-local install: `node plugins/sprint-protocol/scripts/sprint-doctor.mjs <sprint-name>`
   - global install: `node ~/plugins/sprint-protocol/scripts/sprint-doctor.mjs <sprint-name>`
5. Rebuild `update_plan` from the artifacts.
6. Continue from the first incomplete queue item.

Never resume from memory alone.
