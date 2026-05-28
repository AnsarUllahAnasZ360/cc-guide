# Delegation — the orchestrator does NOT do it all

> Sub-agent delegation is the difference between a run that lands and a run that drowns in its own context. Every authored goal must make delegation explicit and CLI-native. This card is the policy + the per-CLI mechanics.

## Why delegation is mandatory
- A single context that tries to read the whole codebase, hold every intermediate result, and do all the work will compact, lose state, and "forget" — the classic long-run failure (attention amnesia).
- The fix: the orchestrator stays thin. It reads high-level state, plans, dispatches bounded slices to sub-agents (each with its own fresh context), and synthesizes their summaries. Mechanical/heavy work and parallelizable investigation go to sub-agents; the orchestrator owns requirements, architecture, decisions, and final accountability.

## The orchestrator's job (all CLIs)
- Maintain the plan / task list as the source of truth.
- Dispatch bounded, non-overlapping work to sub-agents — clear input, clear expected output, no shared write scope that could collide.
- Read sub-agent summaries (not their full transcripts), reconcile, decide, and update the state files.
- Never carry the entire job in one window; persist outputs to disk and re-read on demand.

## Each delegated unit must return
- Findings + evidence · files changed · validation run + result · risks / blockers · a recommendation. A sub-agent that returns vibes is a failed delegation.

## CLI-native mechanics (author the right one)
- **Claude Code:** in-conversation **subagents** for bounded side tasks (own context, return a summary); **Agent View** for independent parallel sessions; **Agent Teams** (experimental) for a shared-task-list supervised group; **Dynamic Workflows** for 16–1000 agents orchestrated by a script. Pick the smallest that fits.
- **Codex:** **NO sub-agents inside a goal.** Parallelize with separate **threads** and **git worktrees**. Never author "spawn a worker" for Codex — author "open a worktree / parallel thread for X" instead.
- **Antigravity:** the orchestrator spawns **async sub-agents with isolated context** (documented); use the **browser sub-agent** for UI verification; steer running agents by commenting on their **Artifacts**. Do NOT depend on undocumented role names, spawn caps, or self-succession (see `antigravity.md`).

## Context hygiene (bake into the goal)
- Persist every meaningful output to the filesystem (a project VFS, the repo, or state files); re-read instead of carrying it in context.
- Keep heavy/repetitive extraction in deterministic tools, not free-form reasoning, wherever the work is mechanical.
- One bounded unit of work per sub-agent call; don't let a single sub-agent accumulate the whole job.

## Parallel vs serial — the safety check
- Parallelize only what is truly independent and safe to run at once. Shared, single-instance resources (one local dev server, one database, a process that a config edit restarts) force serialization — running parallel against them causes thrash, collisions, or crashes.
- When in doubt: parallelize read-only research and independent slices; serialize anything that writes shared state or restarts a shared process. State this choice explicitly in the goal.
