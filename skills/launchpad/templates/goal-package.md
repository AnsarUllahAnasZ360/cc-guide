# Template — Goal Package

> The output when the mode is goal. A small folder of docs that makes a long autonomous run land. Create it under `docs/goals/<goal-name>/` (or the repo's convention). The executor reads `GOAL.md` first; everything else supports it.
>
> Adapt to the chosen CLI (see the CLI cards): Claude `/goal` needs a crisp machine-checkable completion condition; Codex wants the six ingredients + a Prompt/Plan/Documentation trio for long-horizon work; Antigravity wants a Planning-mode goal with explicit async sub-agents.

## Files in the package
- `GOAL.md` — the pasteable goal: outcome, read-first, requirements, acceptance criteria, gates. The one file you hand the CLI.
- `operating-agreement.md` — HOW to work: the iterate loop, delegation, research + verification rules, commit cadence, guardrails.
- `definition-of-done.md` — the verification surface + acceptance checks (use `../reference/definition-of-done.md`).
- `status.md` — the live board (done / in-progress / blocked). Updated continuously.
- `iteration_log.md` · `decision_log.md` · `change_log.md` — append-only run records.
- `scratchpad.md` — disposable working notes.
- `handoff.md` — succession state so a fresh session resumes with zero re-discovery.

---

## `GOAL.md` template

```markdown
# <Goal name>

## Outcome
<One paragraph: what is TRUE when this is done — the single objective.>
- Working directory: <abs path>
- Integrity mode: <development | production>
- Executor: <Claude Code | Codex | Antigravity> · Mode: <goal | workflow>

## Read first (the contract — do NOT skip)
- <file/doc> — <why it matters>
- AGENTS.md / CLAUDE.md — repo truth + conventions
- operating-agreement.md — HOW to work (authoritative)
- definition-of-done.md — what "done" means + the verification surface

## Requirements
### R1. <name>
- <what must be achieved> · verified by <verification surface>
### R2. <name>
- ...

## Definition of Done (acceptance criteria)
- [ ] <quantified, evidence-gated check 1>
- [ ] <check 2>
- [ ] All logs current; handoff.md kept live.

## How to work (summary — full rules in operating-agreement.md)
- Plan first: write a task list and keep it the source of truth.
- Delegate: the orchestrator dispatches sub-agents (CLI-native) and never carries the whole job in one context.
- Use skills/tools: load the relevant domain skills; don't reinvent.
- Research before any non-obvious change; ground it in an official source (cite in decision_log.md).
- Verify against the named verification surface; no self-grading.
- Commit cadence: <when / branch / paths>; never deploy unless asked.

## Guardrails
- Boundaries: <which files/dirs/tools are in scope>.
- Constraints: <what must not regress>.
- Iteration policy: <how to choose the next action; cap = N per unit, then document + advance>.
- Blocked-stop: if no defensible path remains, document why and stop; raise the human only when genuinely blocked.
- No fabrication, no overfit: never hard-code a value to "hit" the check.

## Autonomy
<For an autonomous run: operate start-to-finish; make documented decisions and keep moving. The only human stop is <the CLI's interrupt mechanism / a genuine blocker>.>
```

---

## `operating-agreement.md` template

```markdown
# Operating Agreement — <goal name>
> Authoritative on HOW to work. Bullets only.

## The loop
- For each unit: Plan → Delegate → Run → Verify → Diagnose → Research → Surgical change → Re-verify → Log.
- Cap at N iterations per unit; then document the blocker, revert to last-stable, and advance.

## Delegation (CLI-native — see the CLI card)
- <Claude: subagents / Agent View / Teams / Dynamic Workflows | Codex: threads / git worktrees (NO in-goal sub-agents) | Antigravity: async sub-agents + browser sub-agent>.
- Orchestrator stays thin: plans, dispatches bounded non-overlapping slices, reads summaries, decides, updates state. Each unit returns findings / evidence / changed files / validation / risks / recommendation.

## Research & grounding
- No guessing. Confirm framework behavior against official docs; confirm domain decisions against the relevant standard. Cite the source in decision_log.md.

## Verification (no self-grading)
- Verify against the named verification surface. Use an independent check or cross-model judge for holistic outcomes. Anti-overfit: every change must generalize across cases.

## Surgical-edit discipline
- Change only what the diagnosis demands. No "while I'm here" refactors. Run typecheck/lint/build after each change; a broken build is a hard-fail — fix or revert before proceeding.

## Commit cadence
- <e.g. commit after each unit graduates / each milestone; stage explicit paths; clear messages; branch = <name>; never deploy unless asked>.

## Logging (append immediately, bullets only)
- status.md — the board; update after every run.
- iteration_log.md — one entry per run: id, date, unit, result/verdict + reasons, next action.
- change_log.md — one entry per edit: file(s), what + why, typecheck PASS/FAIL.
- decision_log.md — one entry per non-obvious choice: the choice, rationale, cited source.
- scratchpad.md — transient notes; disposable.
- handoff.md — succession state; keep current so any session resumes cleanly.

## Guardrails
- Boundaries / constraints / iteration cap / blocked-stop as in GOAL.md. No fabrication, no overfit, no deploy.
```

---

## Log stubs (create empty, with the entry format at the top)

```markdown
# status.md       — board of units × status; update after every run.
# iteration_log.md — [ITERATION-XXX] date · unit · result + reasons · next action
# change_log.md    — [CHANGELOG-XXX] date · file(s) · what+why · typecheck PASS/FAIL
# decision_log.md  — [DECISION-XXX] date · choice · rationale · cited source
# scratchpad.md    — transient notes; promote anything durable to the right log
# handoff.md       — current state, active sub-agents, resume point, next steps
```

## Authoring notes
- Fill every `<slot>`. An unfilled slot is a vague goal — the thing that wastes the run.
- The DoD acceptance criteria must be checkable; mirror them from `definition-of-done.md`.
- For Codex, also produce the Prompt.md / Plan.md / Documentation.md trio (long-horizon pattern) — see `../reference/codex.md`.
- For Antigravity, state Planning mode + the async-sub-agent plan; rely on Artifacts for steering and the browser sub-agent for verification.
