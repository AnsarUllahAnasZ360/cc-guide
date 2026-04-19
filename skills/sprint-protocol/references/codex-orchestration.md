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
| Durable wakeup | `automation_update` heartbeat | Only when the user wants continued monitoring or later follow-up. |

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

If the user asks for many agents, parallelize independent read-only work freely. For code edits, cap active workers at two unless the stories touch clearly disjoint areas.

## Durable State

`state.md` is the lead ledger. Update it at phase start, before spawning a batch, after integrating a batch, and before any pause.

Minimum fields:

- current phase and status
- current branch and base branch
- active agents and assigned work
- pending queue
- blockers and decisions
- resume instructions

`progress.md` is the worker ledger. It is append-only. Workers must read all entries before editing and append one entry before completion.

## Git Safety

- Inspect `git status --short --branch` before edits and before commits.
- Never revert unrelated user changes.
- Workers must stage specific files only.
- Keep one commit per story when possible.
- Verification fixes may use one or more `[VERIFY]` commits, grouped by issue or story.

## Compaction Recovery

After compaction or resume:

1. Read `state.md`.
2. Read `README.md` if it exists.
3. Read all of `progress.md` if Phase 4 or later.
4. Run `node plugins/sprint-protocol/scripts/sprint-doctor.mjs <sprint-name>`.
5. Rebuild `update_plan` from the artifacts.
6. Continue from the first incomplete queue item.

Never resume from memory alone.
