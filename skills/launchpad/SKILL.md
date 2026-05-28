---
name: launchpad
description: Decide HOW to run a coding task — interactive, goal mode, or a workflow — then author the launch-ready prompt or goal package for Claude Code, Codex, or Antigravity. Use when the user says "launchpad", "start a goal", "set up a goal/sprint", "should this be a goal or interactive", "plan an autonomous run", "I want to brain-dump a task", "help me write a goal prompt", or is about to kick off a long autonomous run and wants it scoped, delegated, and verifiable first.
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
  - Write
  - Edit
  - Bash
  - TodoWrite
  - AskUserQuestion
  - Task
  - WebSearch
  - WebFetch
---

# Launchpad

The pre-flight front door for any non-trivial coding task. You brain-dump what you want; Launchpad decides the right **mode** (interactive / goal / workflow) and the right **CLI** (Claude Code / Codex / Antigravity), grills you on what is missing, then hands you a **launch-ready artifact** with delegation, a definition of done, and verification already built in.

- **The quality of the launch artifact determines the quality of the run.** A vague goal burns hours of autonomous compute and lands nothing. A sharp one ships product while you sleep.
- This skill is the thing you reach for *before* you type `/goal`, open Antigravity, or start a Codex run — not after.

## What Launchpad is NOT

- It does **not** implement the task. Its only job is to produce the launch artifact (a prompt, or a goal package). You launch the run yourself in the target CLI.
- It does **not** guess about a CLI. Unsupported behavior is never authored (see the per-CLI cards). Every recommendation is grounded in an official source.
- It does **not** rush to author. It researches and grills you *in the middle* — after it understands, before it plans.

## Core philosophy

- **You are intelligent.** These are thinking frameworks, not rigid scripts. Adapt to the task in front of you.
- **Outcome first.** Lead with what must be TRUE when the work is done — not a list of steps.
- **Verify, don't assume.** A goal is "done" only when checked against concrete evidence (tests, artifacts, logs, a judge) — never because the model believes it is.
- **Delegate by default.** The agent that runs the goal must orchestrate sub-agents, not carry the whole job in one context. Launchpad itself delegates research to sub-agents to protect its own context.
- **Right-size the mode.** Most tasks are interactive. A goal is for substantial work with a verifiable end state. A workflow is for many-agent, parallel, cross-checked jobs. Picking the wrong size wastes time.

## Guardrails

- Do **not** start building the task. Produce the launch artifact, then stop.
- Grill **in the middle** (after research, before planning) — not as an opening interrogation, not as an afterthought.
- Get **explicit approval** of the plan before emitting the artifact.
- Author **only officially supported** behavior for the chosen CLI. When a CLI lacks a capability, route to its supported equivalent.

## The flow (do these in order)

Launchpad runs a 7-phase intake. Full detail: `intake/flow.md`.

1. **Intake** — the user invokes `/launchpad` and brain-dumps. Read every file/path/link they reference. Do not react yet.
2. **Research (delegated)** — spawn sub-agents to explore the codebase and any external unknowns. Synthesize their findings yourself. Keep your own context clean.
3. **Mode assessment** — apply `reference/mode-decision.md`. Recommend interactive / goal / workflow + the CLI, and say WHY. If the finish line is vague, do NOT pick a mode — clarify first.
4. **Grill (the middle)** — using `intake/grilling.md`, ask about gaps, hidden assumptions, scope edges, and above all the **Definition of Done** and how it will be verified. One set of questions at a time.
5. **Plan** — present the structured plan: outcome, DoD, what-to-read, task list, delegation map, success condition, where outputs are saved, the runtime/doc system, commit cadence, and how it concludes + verifies.
6. **Approve** — get explicit go-ahead. Adapt and re-present if needed. Never emit before approval.
7. **Emit (adaptive)** — produce the artifact tuned to the chosen mode + CLI (see Output), plus the exact command to launch it.

## Mode decision (summary)

Full tree + citations: `reference/mode-decision.md`.

| Mode | Use when | Never when |
| --- | --- | --- |
| **Interactive** | One answer, one edit, an explanation, a short review, or anything exploratory where you want a stop after the response. | (this is the default — when in doubt, start here) |
| **Goal** | Substantial work with a single, *verifiable* end state that runs across many turns in one coherent thread (migration, flaky-test hunt, perf tuning, multi-step refactor, research-with-artifact). | The finish line is vague, or you'd use it to "hide uncertainty." Clarify first. |
| **Workflow** | Many agents / parallel phases / cross-checking / large fan-out (codebase-wide audit, 500-file migration, multi-angle research). | A handful of sub-agents in one turn would do — use a goal instead. |

## CLI awareness (author only what each supports)

Launchpad tailors the artifact to the executing CLI. Read the matching card before authoring.

| CLI | Goal primitive | Delegation model | Card |
| --- | --- | --- | --- |
| **Claude Code** | `/goal` (loops to a verified condition); **Dynamic Workflows** for big parallel jobs | Subagents, Agent Teams, Agent View, Workflows | `reference/claude-code.md` |
| **Codex** | **Goals** (single-thread, evidence-gated, six required ingredients) | NO in-goal sub-agents — parallelize via **git worktrees** / parallel threads | `reference/codex.md` |
| **Antigravity** | **Agent Manager** goal in Planning mode | Async sub-agents with isolated context (orchestrator + browser sub-agent are the documented roles) | `reference/antigravity.md` |

> Never instruct a CLI to do something it does not support (for example, spawning sub-agents inside a Codex goal). Route to the supported equivalent and say so.

## What every authored goal bakes in

This is the reusable framework — the part that makes an autonomous run actually land. Detail in `templates/goal-package.md`, `reference/delegation.md`, `reference/definition-of-done.md`.

- **Outcome** — one line: what is TRUE when done, plus working directory and integrity mode.
- **Read-first contract** — exactly which files/docs the executor must read before acting.
- **Definition of Done** — quantified, evidence-gated, naming the *verification surface* (the test/artifact/command/judge that proves it).
- **Task-list mandate** — the executor plans before acting and keeps the plan as the source of truth.
- **Delegation mandate** — the orchestrator dispatches sub-agents (CLI-native) and does NOT carry the whole job in one context.
- **Skill-usage mandate** — load the relevant domain skills/tools; do not reinvent.
- **Runtime + state system** — file-based logs (status / iteration / decision / change / scratchpad / handoff); the run is resumable from artifacts alone.
- **Progress + documentation cadence** — when and where to write updates.
- **Commit cadence** — explicit: when to commit, on what branch, which paths; never deploy unless asked.
- **Conclusion** — how it verifies, the closeout artifact it produces, and the next-steps it records.
- **Guardrails** — constraints, boundaries, iteration policy, blocked-stop condition; independent verification (no self-grading); official grounding; anti-overfit.

## Output (adaptive by mode)

- **Interactive** → one tight, pasteable prompt. Template: `templates/interactive-prompt.md`.
- **Goal** → a full goal package (a folder of docs) modeled on a proven layout. Template: `templates/goal-package.md`.
- **Workflow** → a workflow brief (phases, agents, cross-checks). Template: `templates/workflow-brief.md`.

## Required references (read on demand)

- Choosing the mode: `reference/mode-decision.md`
- The CLI you're authoring for: `reference/claude-code.md` · `reference/codex.md` · `reference/antigravity.md`
- Writing the prompt/goal well: `reference/prompting.md`
- Delegation patterns: `reference/delegation.md`
- The definition of done: `reference/definition-of-done.md`
- The intake process: `intake/flow.md` · `intake/grilling.md`
- Output templates: `templates/interactive-prompt.md` · `templates/goal-package.md` · `templates/workflow-brief.md`

## Invocation

- The user types `/launchpad` and brain-dumps a task (text, file paths, links).
- Run the 7-phase flow: research, grill in the middle, plan, get approval, then emit.
- Hand back the artifact + the exact command to launch it in the chosen CLI, and remind the user that launching the run is their step.
