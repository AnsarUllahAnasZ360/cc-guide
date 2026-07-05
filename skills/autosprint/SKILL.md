---
name: autosprint
description: Plan and autonomously execute engineering sprints end to end — research a problem with small agent teams, write an epic/task sprint plan with self-contained per-task specs, launch the bundled dynamic-workflow executor (one agent per task, per-task commits, autonomous epic reviews, live progress dashboard), and hand off a PR with a completion report and human verification guide. Use when the user wants to plan or run a sprint, audit a problem before sprinting it, turn research or a PRD into autonomously executable work, launch overnight/unattended implementation, check on or resume a running sprint, or hand finished AI work to engineers for verification. Successor to sprint-protocol, built on Claude Code dynamic workflows, with optional Codex CLI task routing.
---

# Autosprint

One person architects; AI executes; engineers verify and ship. Autosprint standardizes that split. The operator (usually a founder or lead who plans across several projects) researches and approves a sprint plan, launches it, and walks away. A deterministic workflow implements it task by task with per-task commits and autonomous reviews. What comes back is a PR a human engineer can trust enough to verify, iterate, and merge — because it carries its plan, its evidence, its decisions, and a guide for testing it.

## Terminology

| Term | Meaning | Unit of |
| --- | --- | --- |
| **Sprint** | One autonomous delivery: one branch, one workflow run, one PR, one dashboard, one completion report | Handoff |
| **Epic** | A themed group of tasks inside a sprint; ends with an autonomous review that audits, repairs, and commits | Quality checkpoint |
| **Task** | One problem, one fresh-context agent, one commit, own spec file | Execution |
| **Run** | A single execution of the sprint workflow; interrupted sprints resume as a new run that skips completed work | Recovery |
| **Ledger** | `status.jsonl` — append-only event log every agent writes to; the single source of live truth | State |

A sprint has no fixed size limit — the executor runs each task in its own fresh context, so a sprint can span many hours or days of autonomous work and land an entire feature, a large refactor, or a broad bug sweep. What grows with sprint size is the human verification burden at the end: when a plan gets enormous, *advise* the operator on how it could split into sequential sprints (and what each PR would deliver), then let them decide. Their team's review capacity is their call, not the skill's.

## The four modes

Identify which mode the user is in and read only that reference. Users enter at any mode: a well-understood problem skips straight to plan; a written sprint goes straight to launch.

| Mode | When | Reads | Produces |
| --- | --- | --- | --- |
| **Discover** | Unknowns, audits, "something is wrong", open questions, new initiative | `references/discover.md` | `research.md` — problem findings, solution direction, resolved decisions |
| **Plan** | Research (or an understood problem) ready to become executable work | `references/plan.md`, `references/task-spec-template.md` | `sprint.md`, `sprint.json`, `epics/**` task specs, `verification-guide.md` |
| **Launch** | An approved sprint plan exists | `references/launch.md` | Running workflow, live dashboard artifact, then completion report + PR |
| **Status / Resume** | "How is the sprint doing?", session died, run interrupted | `references/launch.md` (Monitoring and Resume sections) | Refreshed dashboard, or a resumed run |

`references/handoff.md` holds the verification-guide and completion-report formats (used by plan and launch). `references/codex-lane.md` covers routing tasks to Codex CLI — read it only when the user wants Codex/GPT execution.

### What the operator says, and what happens

There is no ceremony to invoking a mode — plain language plus a path is enough:

- *"/autosprint — X is broken and I don't know why"* → discover
- *"plan a sprint from sprints/<id>/research.md"* (or just "plan it" after discover) → plan
- *"launch the sprint at sprints/<id>"* (or "launch it" after approval) → launch: validate, confirm gaps, fire the workflow, hand back the dashboard URL
- *"how's the sprint doing?"* / *"resume the sprint at sprints/<id>"* → status/resume from the ledger, in any session

Sprint folders live at **`sprints/<sprint-id>/`** in the repo root (date-prefixed slug, e.g. `sprints/2026-07-billing-dunning/`). If the repo already has a home for planning docs (`docs/sprints/`, etc.), follow the house convention — what matters is that the folder is committed and travels in the PR, not where it sits.

## Invariants

**Files are the memory.** Every mode must be resumable from the sprint folder alone — a new session, a different machine, a different agent should be able to continue from disk. Chat history is never load-bearing. This is also why the ledger is append-only JSONL: no read-modify-write corruption, and live state is always derivable by replaying it.

**The executor is the backbone; treat it as a template, not scripture.** Execution defaults to `assets/executor.workflow.js` from this skill, launched with `sprint.json` data as args — the plan is data, the engine is code, and nobody hand-writes orchestration from scratch per sprint. When a sprint genuinely needs a different shape (say, adversarial verification on a security epic, or a tournament for a design-heavy task), copy the executor into the sprint folder, adapt the copy, and launch that — the sprint folder then carries its own engine, and the skill's canonical file stays pristine. What separates this from freehand scripting: every adaptation keeps the load-bearing contracts intact — the ledger events, per-task commits, epic reviews, and the ship phase — because the dashboard, resume, and handoff all depend on them.

**One agent, one task, one commit.** Fresh context per task is the strongest cross-system finding in autonomous-execution practice: long shared contexts rot, and compaction loses what matters. The commit-per-task convention (`[SPRINT-ID/TASK-ID] title`) makes git itself the audit trail the epic reviewer and the human verifier walk. Parallel execution doesn't bend this: concurrent tasks run in isolated git worktrees and an integration agent lands their commits on the sprint branch in order, so the history stays linear and walkable no matter how wide the run was.

**Reviews are gates that fix, not gates that stop.** Once launched, nothing waits for a human. Every epic ends with a reviewer agent that audits the epic's commits against its specs — correctness, removal of replaced code, defects, excess code — and autonomously repairs bounded problems. Failure doesn't halt the run; it fails the epic, skips its dependents, and the sprint ships what survived with an honest report. The only human approval gate in the whole system is sprint-plan approval before launch.

**Complexity, never time.** Tasks carry `simple | standard | complex`. Complexity does two jobs: it routes models at launch, and at plan time it triggers decomposition — a task whose one-pass success you doubt is not "complex", it is two tasks. Never estimate hours or days; agents don't bill by them.

**Research never uses workflows.** Discover mode works with small agent teams — two or three at a time, sequenced — because research is iterative and interactive: each round of findings changes the next question, and the operator is present to steer. Workflows are for the opposite regime: deterministic execution of decisions already made.

**Ceremony proportional to the problem.** A contained fix is a one-epic sprint with two or three tasks and a paragraph of research — that's fine. Don't manufacture epics, criteria, or documents the human reviewer will not read; unread artifacts create false confidence, not control.

**Agents tell the truth or the system is worthless.** Every agent prompt in the executor carries the honesty rules: claims audited against command output, failures reported as failures, no weakening or deleting tests to pass, blockers escalated in reports rather than silently worked around. Plan-mode specs support this by making every definition-of-done item binary-checkable.

## Sprint folder

```text
sprints/<sprint-id>/          # e.g. sprints/2026-07-billing-dunning/
  research.md                 # discover output (may be brief)
  sprint.md                   # human-readable plan: goal, epics, rationale, risks
  sprint.json                 # machine-readable plan — the executor's args (schema below)
  epics/
    E01-<slug>/
      README.md               # the epic: theme, why, how its tasks connect, epic-level done
      T01-<slug>.md           # one spec per task
      T02-<slug>.md
  verification-guide.md       # for the human engineer who receives the PR
  status.jsonl                # append-only ledger, written by agents during the run
  completion-report.md        # written by the run's shipping agent
  dashboard.html              # rendered from the ledger; published as an artifact or to R2
```

Each implementer agent gets exactly three layers of context — the sprint's goal (`sprint.md`), its epic's `README.md`, and its own task spec — plus the executor's worker guidelines. That layering is deliberate: enough context to understand where the work fits, without loading the whole plan into every agent.

The sprint folder is committed with the plan and travels inside the PR, so the reviewing engineer gets the full plan, ledger, and guide with the code.

`references/sprint-plan-schema.md` defines `sprint.json` and the executor args contract. Validate before every launch — a malformed plan wastes an entire unattended run.

## Sizing: the task is the unit that must be right

Sprints and epics scale with the problem — plan what the work needs and advise (don't enforce) when a split into multiple sprints would serve the operator's review pipeline better. The sizing skill that actually decides whether a sprint succeeds is **task sizing**, and it fails at both extremes:

- **Too small** (one-line edits as tasks): every fresh-context agent pays the same orientation tax — reading project guidance, the epic, the spec, researching the code — so ten trivial tasks buy ten orientations for one task's worth of work. Batch small related changes into one coherent work item (2–3 related fixes in one component is one task).
- **Too big** (a mini-project as a task): the agent's context bloats mid-flight, attention degrades exactly when the hard part arrives, and the single commit becomes unreviewable. Even with 1M-token windows, performance decays as context grows — smaller working sets outperform stuffed ones.

The target: **a good work item** — one coherent problem a single agent can research, implement, verify, and commit while spending most of its context on the work rather than on re-orienting. Getting this right is the most important thing the planner does; when in doubt between the extremes, prefer slightly larger tasks with tightly written specs over confetti.

Epics stay meaningfully sized too, for one structural reason: the epic review is the quality checkpoint, and every epic gets one — that rhythm (implement → audit → repair → commit) is what keeps a 10-epic sprint from drifting.

## Parallelism is planned, not improvised

How wide the run goes is the operator's choice at plan time (`parallelism` in `sprint.json`), because it trades wall-clock speed against integration complexity — and because the *plan* must be designed for it: parallel waves are only safe when the planner has declared which tasks are truly independent (`deps`) and which touch the same files despite no logical dependency (`conflictsWith`).

- **`minimal`** — one thing at a time, strictly. The safest trajectory to read; right for gnarly, tightly-coupled work.
- **`moderate`** (recommended default) — epics run in order; within an epic, independent tasks run in parallel waves of up to 3.
- **`max`** — for a time crunch: independent epics run concurrently too, waves widen. Costs more integration work and a busier trajectory; reviews catch what seams miss, but recommend it only when the deadline is real.

Mechanics (why this is safe at all): concurrent agents never share a checkout. Parallel tasks run in isolated git worktrees; after each wave, an integration agent cherry-picks their commits onto the sprint branch in order and resolves any accidental seams; all primary-tree operations (merges, reviews, gates) are serialized. Two things never change regardless of width: **every epic ends in its review**, and **end-to-end product testing belongs to humans** — agents verify statically (tests, typecheck, diffs), the verification guide tells your team what to exercise live.

## Model routing is the operator's call — always ask

Never route silently by defaults. During **plan mode**, ask the operator what to run where — their answer depends on rate limits and subscriptions that only they can see that week. Capture it in `sprint.json` (`models`, and `codex` when GPT models are in play, including exact Codex model IDs). Typical answers range from "Fable for everything" to "Sonnet for execution, Opus for reviews" to "route these three epics to Codex" — all valid; the plan just has to record it. Two fixed points worth stating when you ask:

- Planning and discovery run on the session's best model — a stronger planner writing richer specs is what lets cheaper executors punch above their weight.
- Reviews are the only quality gate in an unattended run; recommend against under-routing them, then respect the operator's decision.
