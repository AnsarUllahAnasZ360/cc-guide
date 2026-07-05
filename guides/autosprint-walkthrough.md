# Autosprint: The End-to-End Walkthrough

This document explains how an autosprint actually runs, by simulating one real sprint from problem statement to merged PR. It is a design document for the operator (you) to critique — it is not part of the skill. Where the design makes a judgment call, the reasoning is stated so you can disagree with it precisely.

**The cast:**

| Role | Who | When |
| --- | --- | --- |
| Operator | You (architect/planner) | Discover, Plan, approval, PR review delegation |
| Planning model | The session's best model (Fable) | Discover + Plan — writes everything the executors will read |
| Implementer agents | Whatever you routed (Sonnet/Opus/Codex…) | One per task, fresh context each |
| Epic reviewers | Your strongest routed model | End of every epic — audit, repair, commit |
| Monitor | The Claude Code session that launched the run | Refreshes the dashboard, reports completion |
| Verifiers | Your engineers | After the PR exists |

---

## Part 1 — One sprint, simulated

**The project:** a SaaS with a Stripe billing integration. **The problem:** failed payments just mark subscriptions `past_due` and nothing else happens — no retries, no emails, no suspension. Revenue leaks silently.

### Sunday, 9:00 pm — Discover (~40 minutes, you present)

You open Claude Code in the repo and say:

> "/autosprint — failed payments are leaking revenue. I think we need a proper dunning flow. I don't fully know how the current billing webhooks work or what we already have."

Fable enters **discover mode**. Because you flagged unknowns, it starts with a **blindspot pass** — one agent whose only brief is "what here would surprise the operator's framing?" It comes back with two things you didn't know: there's a *half-built retry cron* from 2024 that still runs nightly (unknown unknown — it would have fought the new flow), and the webhook handler already dedupes some events but not `invoice.payment_failed`.

Two more research agents map the billing module and find how competitors' dunning sequences are typically structured. Between rounds, Fable interviews you — architecture-reshaping questions first:

> "Three questions before I can plan this: (1) Should dunning pause or cancel the old retry cron? (2) Email sequence length — industry default is 3 attempts over 14 days; do you have a policy? (3) Does suspension mean feature-lockout or data-freeze?"

Twenty minutes of this produces `sprints/2026-07-billing-dunning/research.md`: problem findings with file:line evidence, two solution options with a recommendation (state machine in the billing service, kill the cron), and a **Decisions** section — five resolved, zero open. You say "plan it."

### Sunday, 9:40 pm — Plan (~1 hour, you present at start and end)

Fable shapes the work into **3 epics** — volatile decisions first (the state machine's data model is E01 because everything reshapes around it; email templates are E03 because nothing does):

```text
sprints/2026-07-billing-dunning/
  research.md
  sprint.md                 ← goal, epic table, risks, out-of-scope
  sprint.json               ← the executor's args
  epics/
    E01-dunning-state/
      README.md             ← why this epic, how T01→T02 connect, epic-level done
      T01-dunning-state-column.md
      T02-transition-service.md
    E02-webhook-integration/
      README.md
      T01-route-webhooks.md
      T02-dedupe-events.md
      T03-retire-retry-cron.md   ← deleting the old path is a first-class task
    E03-dunning-emails/
      README.md
      T01-email-pipeline.md
      T02-suspension.md
  verification-guide.md     ← written NOW, for your engineer, while criteria are fresh
```

Each task spec is a **context transfer**: the problem, the *why*, everything Fable learned in research that this task's executor will need ("Stripe sends payment_failed up to 4 times — dedupe on event.id, we saw duplicates in prod logs"), a directed research list ("verify the handler shape at webhooks.ts:100-180 before editing"), a binary definition of done, and a test plan. The specs assume nothing survives from this conversation — because at 3 am, nothing will.

Then Fable asks you the **routing question** — never defaulted:

> "Two decisions that are yours: **models** — 7 tasks (1 complex, 5 standard, 1 simple), 3 epic reviews + 1 sprint review; my recommendation is Sonnet for standard/simple, Opus for the complex task, Fable for reviews. Want any of this on Codex? And **parallelism** — minimal, moderate, or max? I recommend moderate: E02's three tasks are independent enough to run as one wave; E01 has to stay ordered either way."

You: "Codex quota is full — route the two webhook tasks to Codex on `gpt-5.2-codex` medium effort. Moderate is fine, no rush this week." It all lands in `sprint.json` (`models`, `codex`, `parallelism`, per-task `engine`, plus the `deps`/`conflictsWith` edges that make the parallel wave safe).

A fresh-context auditor agent then checks every spec against the quality bar (binary criteria, verified-vs-inferred references, sizing at neither extreme), Fable fixes findings, confirms you're on a clean dedicated branch (`sprint/2026-07-billing-dunning`, created from `main`), commits the sprint folder as the branch's first commit, and renders the plan as a **single HTML review page** — epics as sections, task cards, risk highlights. You read it on your phone, push back once ("suspension grace period is 48h not 72h"), the spec is amended, you approve.

**That approval is the last human gate in the whole system.**

### Sunday, 10:45 pm — Launch (~5 minutes)

Launch mode validates `sprint.json` (specs exist, deps resolve, branch exists), runs the Codex preflight (`codex login status`, one smoke exec), asks where the dashboard should live — you pick artifact — and launches:

```
Workflow(scriptPath: <skill>/assets/executor.workflow.js, args: {…sprint.json, startedAt, completedTaskIds: []})
```

The workflow runs **in the background**. The session gives you the dashboard URL, schedules its own wake-ups (~every 25 min: read ledger → re-render dashboard → redeploy to the same URL), and you close your laptop.

### Overnight — Execution (no humans involved)

**Preflight agent** confirms the branch, runs the global checks, records two *pre-existing* test failures in the ledger (so no later agent gets blamed for them), appends `sprint_started`.

**E01 runs.** T01's agent (Sonnet, fresh context) reads its three context layers — `sprint.md` goal → E01's README → its own spec — then follows the worker shape: *verify the map against the territory* (its research pass confirms the handler moved 20 lines since planning — fine), write a short todo list, implement, run targeted tests, append `task_started`/`task_done` ledger events with decisions and insights, and make **exactly one commit**: `[2026-07-billing-dunning/E01-T01] Add dunning_state to subscriptions`. T02 (Opus — you routed complex there) does the same; it logs a **question** to the ledger: "Grace period applied at suspension, not at sequence start — operator input would have changed this; proceeded with spec reading."

**E01 review.** A Fable agent — no human reviews this work before it, and it knows that — reads the specs, the reports, and the *actual diffs* (`git show`, not just what the agents claimed). Four audit dimensions: correctness vs spec, replaced-code deletion, defects, excess code. It finds a race (two webhooks advancing the same subscription concurrently), fixes it, commits `[2026-07-billing-dunning/E01-review] guard double-advance`, appends an `epic_review` event with verdict `repaired`, fixes and risks listed. **The dashboard's Trajectory tab now shows exactly this** — what the review found and what it did about it.

**E02 runs as a parallel wave.** Its two Codex tasks and the dedupe task have no edges between them, so under `moderate` they run concurrently — each agent in its own isolated git worktree, so they never see each other's changes and never race on git. The Codex tasks' agents are still Claude agents, but as *supervisors*: each feeds its spec to `codex exec -s workspace-write -a never -m gpt-5.2-codex`, reviews the resulting diff against the spec, orders one fix-up round via `codex exec resume --last`, then owns the tests, ledger entry, and commit itself. Mid-wave, Codex hits its 5-hour quota window on one task — that agent implements it directly (Claude) and logs the fallback as a decision. When the wave completes, an **integration agent** cherry-picks each task's commits onto the sprint branch in order — history stays linear, one commit per task, as if they'd run sequentially. Nothing stops, and nothing ever waits for a human.

**A failure, handled.** Suppose E03-T01 fails outright (flaky email provider sandbox). The ledger records `task_failed`; T02 declared `deps: [E03-T01]`, so it's skipped, not attempted against a broken foundation. E03's review runs anyway, verdict `failed`, and — because no other epic depends on E03 — **the sprint still ships E01+E02**. There is no state where good completed work sits unreported because something later broke.

**Ship phase.** Four steps, all unattended. A sprint-level reviewer checks what per-epic reviews can't see — cross-epic integration, duplicated logic, non-goal violations. Then the **completion gate**: re-run the global checks and repair any sprint-caused failure (up to 3 rounds) — bugs may ship, but the sprint does not ship red; the code builds, typechecks, and passes its suites modulo what preflight recorded as pre-existing. Then a **docs-sync agent** trues up README, CLAUDE.md, AGENTS.md, and docs/ against what actually changed — nothing more. Finally the shipping agent writes `completion-report.md` (delivered vs planned per epic, gate status up front, git-derived stats, every autonomous decision and flagged question consolidated, tasksAtRisk), updates the verification guide for the scope that actually shipped, pushes, and opens a **draft PR** with a two-audience body: `## For reviewers` (criteria→evidence table, decisions, known issues) and `## For agents` (structured intent and constraints for future agent sessions). No AI attribution anywhere.

### Monday, 7:30 am — You, with coffee

Push notification: *"Sprint 2026-07-billing-dunning finished: E01 clean (repaired), E02 clean, E03 failed. Draft PR #482."* You open the dashboard on your phone: 6/7 tasks, one question waiting for you (the grace-period assumption), the E03 failure with its cause. You skim the completion report, answer the question in the PR thread, and assign the PR to an engineer.

### Monday afternoon — Your engineer

They open the PR: the sprint folder is *in* it — plan, specs, ledger, verification guide. The guide tells them exactly what to do in order: static pass (2 commands, expected outputs), per-epic checks traceable to definition-of-done items, two integration flows, and the risk-targeted list ("read the concurrency guard with suspicion; the 48h grace period was a mid-plan change"). They test locally, find one real issue, push their own fix commit on the branch, flip the PR from draft to ready — **that flip is the human sign-off the whole system is built around** — and merge. E03 becomes a 20-minute follow-up sprint whose research is already written.

---

## Part 2 — The mechanics underneath

**Why the plan is data and the executor is code.** Workflow scripts run sandboxed: no filesystem, no `Date.now()`. So the executor receives the sprint *structure* (ids, spec paths, routing, deps) as `args`, while the *content* (specs, READMEs) is read from disk by the agents, which are full Claude Code agents with all tools. This split is also what makes the skill reusable — the engine is written and tested once; every sprint is just data.

**How parallelism works without corrupting git.** Two agents committing to one shared checkout will destroy each other — git's staging index is shared, so one agent's `git add` bleeds into another's commit. So concurrent tasks never share a checkout: each runs in an isolated git worktree (its own index, own branch, same repo), and after each wave an integration agent cherry-picks the tasks' commits onto the sprint branch in order, resolving accidental seams and refusing to force broken code through. All primary-tree operations — merges, epic reviews, gates — serialize through a lock. The result: history stays linear and per-task no matter how wide the run, and the audit trail the reviews depend on survives. The operator chooses the width at plan time: `minimal` (one thing at a time), `moderate` (parallel waves inside one epic — the default), `max` (independent epics run concurrently too, for real deadlines). The plan carries the safety data — `deps` for order, `conflictsWith` for logically-independent tasks that touch the same files — because the executor can't see file scopes; the planner can.

**Why an append-only JSONL ledger.** `status.jsonl` is written by every agent and rewritten by none: no read-modify-write corruption, and live state is always derivable by replay. Three consumers: the dashboard renders from it, the completion report consolidates from it, and **resume** derives from it — a fresh session replays the ledger, computes `completedTaskIds`/`completedEpicIds`, and relaunches the executor, which skips finished work. Resume never depends on the dead session's memory.

**How the dashboard updates while nobody's home.** The workflow can't publish artifacts; the *launching session* can. It stays alive as a monitor: wake every ~25 minutes → read ledger → inject into the dashboard template → republish (same artifact URL, or `wrangler r2 object put` to your R2 bucket). If the monitor session dies, the run continues unaffected — any new session can re-attach and resume the loop from the ledger.

**What each implementer actually receives.** Three layers of file context (sprint goal → epic README → task spec), plus the executor's embedded worker rules: simplicity ("least correct code; delete what you replace"), honesty ("audit every claim against a command result; never weaken a test to pass it"), scope (stay in the file scope; no `git add -A`; no attribution), ledger contract, and the escalation rule (blocked-with-explanation beats silent workaround). The layering is deliberate: enough context to know where the work fits, no budget wasted loading the whole plan.

---

## Part 3 — The open design questions, answered

### Should Fable write the workflow script per sprint, or use the fixed executor?

**Recommendation: the fixed executor as backbone, adapted as a template when a sprint genuinely needs it.** Three tiers:

1. **Default (most sprints):** use the shipped executor untouched. It encodes the invariants your dashboard, resume, and handoff depend on (ledger events, per-task commits, epic reviews, ship phase), and it's syntax-verified once rather than rewritten at 11 pm every Sunday. A freshly written orchestration script is itself unreviewed code about to run unattended for ten hours — the exact thing this system exists to avoid.
2. **Adapted (occasionally):** when a sprint needs a different shape — adversarial multi-verifier review on a security epic, a tournament for a design-heavy task — Fable copies the executor *into the sprint folder*, modifies the copy, and launches that. The sprint carries its own engine; the canonical file stays pristine. This is exactly how Anthropic's own guidance says skills should ship workflows: "treat skill workflows as templates rather than verbatim scripts."
3. **Freehand (rare):** for orchestration that isn't a sprint at all, write a bespoke workflow — outside this skill.

What you lose with pure per-sprint generation isn't creativity, it's *accumulated debugging*: every fix the executor earns (a fallback, an edge case, a resume quirk) benefits all future sprints only if there's one executor to fix.

### What is the mental model for using Codex/GPT inside Claude Code?

**Codex is a power tool an agent picks up, not a member of the orchestra.** The Codex CLI is a headless subprocess (`codex exec`) that any Claude agent can invoke through Bash — so the workflow's structure stays 100% Claude (orchestration, reviews, commits, reports), and specific tasks swap the *hands* doing the typing. The Claude supervisor feeds Codex the same spec any implementer would get, reviews the diff, iterates a bounded number of rounds, and owns everything downstream. Model choice is explicit — `-m <model-id>` and reasoning effort from `sprint.json`, chosen by you at plan time, never the CLI default — because which GPT variant burns which quota window is your call. Practical notes: Codex's own `workspace-write` sandbox is the containment (don't nest it inside Claude's Bash sandbox — that combination crashes the Codex binary on macOS; the executor's prompts include the retry-unsandboxed fallback), and quota exhaustion mid-run degrades gracefully: the supervisor implements the task itself and logs the fallback as a decision. Front-load Codex tasks if the quota window is tight; keep reviews and ambiguous work on Claude.

### What is the perfect launch environment?

- **A dedicated, clean branch per sprint** — created in plan mode, first commit is the sprint folder. You said keeping the worktree clean is on you; plan mode checks anyway and fixes or tells you.
- **A machine that stays awake.** The monitor session and the workflow live in the launching Claude Code process. On a Mac: `caffeinate -dimsu` (or launch from the desktop app), power connected. A always-on box (Mac mini, small VPS) is the natural end state for weekly cadence.
- **Permissions that won't prompt at 3 am.** The workflow itself runs with auto-accepted edits, but the Codex lane may need an unsandboxed Bash retry — pre-allow `codex` in the project's permission settings so no approval dialog can stall a run.
- **Baseline green before launch.** Preflight records pre-existing failures, but the cleaner the base, the sharper every reviewer's signal. Launch from a commit where global checks pass.
- **One sprint per repo at a time.** Two workflows sharing one working tree cannot both own git. Different projects in different repos can absolutely run the same night — that's your five-project fan-out.

### How do we review and ship?

The sprint's output is designed for a reviewer who wasn't there: draft PR (draft = unverified, by definition), completion report first, verification guide as the ordered playbook (cheap static checks → per-epic criteria checks → integration flows → risk-targeted reading), per-task commits for commit-by-commit review, decisions & questions consolidated so human judgment goes exactly where agents flagged uncertainty. The engineer adds fix commits on the same branch, flips draft→ready as sign-off, merges. Anything bigger than a bounded fix becomes the next sprint's research input — the loop closes.

---

## Part 4 — Failure modes → design answers

| Failure mode (documented in the field) | Design answer |
| --- | --- |
| Agent claims done when it isn't | Evidence rule in every prompt; binary DoD; reviewer audits diffs, not reports |
| Tests weakened/deleted to pass | Explicit ban in worker rules; epic reviewer re-runs targeted checks |
| Two code paths after a "replacement" | Deletion is a DoD item; reviewer dimension #2 |
| Context rot on long work | Fresh context per task; three-layer context diet; task sizing at neither extreme |
| One bad epic poisons the night | Dependency fuses skip only dependents; everything else ships with an honest report |
| Orchestration bug kills a 10-hour run | One tested executor, not per-sprint scripts; ledger-based resume |
| Codex quota / crash mid-run | Supervisor fallback to Claude, logged as a decision |
| Operator can't see what happened | Ledger → dashboard (Kanban/Trajectory/Decisions), completion report, dual-audience PR |

---

*Comment on anything here — especially Part 3's recommendations — and the skill gets amended to match.*
