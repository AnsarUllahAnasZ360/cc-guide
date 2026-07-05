# Plan mode — writing the sprint

Plan mode turns `research.md` (or a directly understood problem, or an external packet like a PRD/spec) into the executable sprint: `sprint.md`, `sprint.json`, per-task specs, and `verification-guide.md`. This is the highest-leverage work in the whole system — execution quality is dominated by plan quality, and everything downstream runs unattended. Spend the effort here.

The output must pass one test: **could this sprint execute correctly if the operator disappeared the moment it launched?** Every ambiguity you leave becomes an agent's guess.

## Order of work

1. **Absorb inputs.** Read `research.md` fully — its Decisions section is binding. If an *open* decision blocks task design, stop and ask now; this is the last cheap moment to do so. For external packets (PRD, spec), review for contradictions and untestable claims first, exactly as discover mode would.

2. **Shape epics.** Group the work into themes where each epic leaves the codebase in a coherent, reviewable state — feature-driven, not layer-driven (an epic is "dunning state machine", not "all the database changes"). Order epics so work compounds and **volatile decisions land first**: data models, type interfaces, and user-facing contracts go early because everything downstream reshapes around them; mechanical refactoring goes last because it reshapes around nothing. Set `dependsOn` only where a failed epic would genuinely invalidate a later one; independent epics let the sprint ship partial value when something fails. Size the sprint to the problem — and when the plan grows genuinely enormous, advise the operator on a split into sequential sprints (what each PR would deliver, what order), then let them decide.

3. **Cut tasks.** Within each epic, cut along verification boundaries into *good work items* — SKILL.md's sizing section defines the two failure extremes (confetti tasks that pay orientation tax repeatedly; mega-tasks that rot their own context). Split when you doubt one-pass success; merge when two "tasks" would touch the same files with the same tests (thin horizontal slices create integration defects between agents).

4. **Write the epic READMEs and specs.** Each epic folder gets a `README.md` (theme, task connections, epic-level definition of done, epic-wide gotchas) and one spec per task — formats in `references/task-spec-template.md`. The specs are context transfers to cheaper execution models: everything the planner knows that the executor will need, especially the "why" and the rejected alternatives. Use writer agents in small batches (2–3) for large sprints, each doing targeted code research before writing; write them yourself for small ones. Either way every spec gets the same audit (below).

5. **Ask the operator about model routing and parallelism.** Never default silently — both answers depend on things only they can see this week (rate limits, deadlines). Ask: which models for simple/standard/complex tasks, which for reviews, whether to route any work to Codex (and if so, the exact Codex model ID and reasoning effort), and how wide to run — `minimal` / `moderate` / `max` (recommend moderate; offer max when they signal time pressure). Record all of it in `sprint.json`. Recommend against under-routing reviews — they're the only quality gate — then respect the decision.

   Parallelism is a *design* input, not a launch flag: for moderate/max, the task graph must carry it — `deps` where order genuinely matters, `conflictsWith` between logically-independent tasks that touch the same files, cross-epic task deps only into epics named in `dependsOn`. Getting these edges right is what makes wide waves safe; when honestly unsure whether two tasks can share a wave, add the edge — a serialized pair costs minutes, a bad merge costs the epic review's whole budget.

6. **Write `verification-guide.md`** per `references/handoff.md` — plan it now, while acceptance criteria are fresh, not after execution.

7. **Audit before presenting.** Spawn one fresh-context auditor agent to check every spec against the template's quality bar: binary definition of done, verified-vs-inferred references, named replaced code, file scopes consistent with the dependency order, dependency references that resolve in `sprint.json`, task sizing at neither extreme. Fix what it finds. A fresh reader catches what the writer cannot.

8. **Settle the branch, then assemble and commit.** The sprint executes on its own branch and becomes one PR. If the operator hasn't already put you on a clean, dedicated branch, say so and fix it: confirm the worktree is clean (or what to do with dirty state), create `sprint/<sprint-id>` from the base branch, and switch. Then assemble `sprint.md` and `sprint.json` (schema: `references/sprint-plan-schema.md`), run the schema validation checks, and commit the sprint folder as the branch's first commit.

9. **Present for approval.** This is the system's single human gate. Show the operator: goal, epic sequence with themes, task table (id, title, complexity, engine), model routing as agreed, risk areas, what was deliberately excluded, and any place you overrode their stated preferences — with why. For sprints of any real size, render the plan as a single self-contained HTML review page (epics as sections, task cards, dependency arrows, risks highlighted) — operators actually read visual plans, and skim-then-approve on a wall of markdown is how bad plans slip through. Handle feedback visibly: each item addressed, deferred with reason, or pushed back on. Launch only an approved plan.

## sprint.md

Human-readable companion to `sprint.json` — the document the operator approves and the reviewing engineer reads first:

```markdown
# Sprint <id>: <title>

## Goal            <!-- one paragraph, outcome language -->
## Why now         <!-- link back to research.md findings -->
## Epics
| ID | Theme | Tasks | Depends on | What it leaves behind |
## Out of scope    <!-- explicit, from research decisions -->
## Risks           <!-- what might fail and what the blast radius is -->
## Verification surface   <!-- what the human team will test, one line per epic -->
```

## Judgment calls that recur

- **Complexity honesty beats optimism.** Marking a doubtful task `standard` doesn't make it standard; it makes it fail at 3am. When in doubt, split or mark `complex`.
- **First tasks carry the sprint.** Put the riskiest foundation work in E01 — if it fails, the epic-dependency fuses stop dependent work early and cheaply, and the sprint still ships the independent epics.
- **Don't spec browser/live verification into tasks.** Execution verifies statically: code review, targeted tests, typecheck. Live-product verification belongs to the human team via the verification guide — unless the operator explicitly orders otherwise for a specific task.
- **Quality closure is the reviewers' job, not extra tasks.** Don't add "review the code" or "clean up" tasks — the epic review and sprint review already do this with fix authority. Add a task only for substantive hardening work (e.g. "add integration test harness for X").
- **A packet is input, not a plan.** When the operator hands you a PRD or spec, the epics/tasks are still yours to shape; a document's section structure is almost never a correct execution decomposition.
