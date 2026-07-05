# sprint.json — the executor's contract

`sprint.json` is the machine-readable half of the plan. Launch mode reads it, validates it, adds the launch-time fields (`startedAt`, resume state), and passes the whole object as `args` to `assets/executor.workflow.js`. The executor script cannot read files itself — workflow scripts have no filesystem access — so everything the *orchestration* needs must be in this file. Everything the *agents* need beyond that lives in the task spec files, which agents read from disk.

Keep it lean: ids, titles, paths, routing, dependencies. Rich content (problem statements, solution direction, test plans) belongs in the spec files, not here.

## Shape

```json
{
  "sprint": {
    "id": "2026-07-billing-dunning",
    "title": "Billing dunning flow",
    "goal": "Failed payments trigger a 3-step dunning email sequence with account suspension on exhaustion.",
    "folder": "sprints/2026-07-billing-dunning",
    "branch": "sprint/2026-07-billing-dunning",
    "baseBranch": "main"
  },
  "parallelism": "moderate",
  "models": { "simple": "sonnet", "standard": "sonnet", "complex": "opus", "review": "fable" },
  "codex": { "model": "gpt-5.2-codex", "reasoningEffort": "medium" },
  "docs": { "sync": true },
  "checks": {
    "targeted": "npm test -- billing",
    "global": "npm run typecheck && npm test"
  },
  "pr": { "create": true, "base": "main", "draft": true },
  "dashboard": { "target": "artifact" },
  "epics": [
    {
      "id": "E01",
      "title": "Dunning state machine",
      "theme": "Core state transitions and persistence",
      "readmePath": "sprints/2026-07-billing-dunning/epics/E01-dunning-state/README.md",
      "dependsOn": [],
      "tasks": [
        {
          "id": "E01-T01",
          "title": "Add dunning_state to subscriptions with migration",
          "specPath": "sprints/2026-07-billing-dunning/epics/E01-dunning-state/T01-dunning-state-column.md",
          "complexity": "standard",
          "engine": "claude",
          "deps": []
        },
        {
          "id": "E01-T02",
          "title": "Implement dunning transition service",
          "specPath": "sprints/2026-07-billing-dunning/epics/E01-dunning-state/T02-transition-service.md",
          "complexity": "complex",
          "engine": "claude",
          "deps": ["E01-T01"],
          "conflictsWith": []
        }
      ]
    }
  ]
}
```

## Field rules

- **`sprint.id`** — stable slug, appears in every commit message (`[<id>/<taskId>] …`). Date-prefixed keeps folders sorted.
- **`parallelism`** — `minimal | moderate | max`, the operator's choice at plan time (recommend `moderate` by default; `minimal` = strictly one thing at a time; `max` = independent epics run concurrently too, for time crunches). Execution mechanics: parallel tasks run in isolated git worktrees and an integration agent lands their commits on the sprint branch in order — see the executor. The plan must be *designed* for the chosen level: deps and `conflictsWith` are what make parallel wavefronts safe.
- **`docs.sync`** — `false` disables the end-of-sprint documentation sync agent (default on).
- **`models`** — values are `haiku | sonnet | opus | fable`, or `null` to inherit the session model. **Set by asking the operator during plan mode — never silently defaulted.** Persisted here so scheduled or resumed runs never re-ask.
- **`codex`** — present only when codex tasks exist: the exact Codex model ID the operator chose (e.g. current gpt-*-codex variants — never assume the CLI default) and optional `reasoningEffort` (`low|medium|high`), passed to `codex exec` as `-m` / `-c model_reasoning_effort=`.
- **`checks.targeted`** — fast suite the epic reviewers run; **`checks.global`** — what preflight baselines and the final sprint review runs. Either may be `null`; agents then fall back to what the specs name.
- **`pr.create: false`** — run ends after the completion report; the operator pushes and opens the PR manually.
- **`dashboard`** — `{ target: "artifact" }` or `{ target: "r2", r2: { bucket, prefix, publicUrl } }` (see launch reference).
- **`epics[].readmePath`** — the epic's README.md; implementer agents read it as their second context layer.
- **`epics[].dependsOn`** — epic ids. An epic is skipped (not attempted) if a dependency epic's review verdict was `failed`.
- **`tasks[].deps`** — task ids. Dual role: skip logic (a task is skipped if a dependency failed/blocked/was skipped) and scheduling (a task only enters a wave once its deps are done). Cross-epic deps are allowed only into epics listed in this epic's `dependsOn` — that's what keeps `max` epic-parallelism safe.
- **`tasks[].conflictsWith`** — task ids in the same epic that must never run in the same parallel wave (they touch the same files despite having no logical dependency). The planner declares these; the executor cannot see file scopes.
- **`tasks[].engine`** — `claude` (default) or `codex` (see `references/codex-lane.md`; only after the operator opts in and `codex login status` passes). **`tasks[].codexModel`** overrides the sprint-level codex model per task.
- **`tasks[].complexity`** — `simple | standard | complex`. Routes models per the operator's plan-time answers. If you find yourself wanting a tier above complex, the task needs splitting instead.

## Launch-time fields (added by launch mode, never stored in the plan)

```json
{
  "startedAt": "2026-07-06T03:00:00Z",
  "sprint": { "root": "/abs/path/to/repo" },
  "completedTaskIds": [],
  "completedEpicIds": []
}
```

`startedAt` comes from `date -u +%Y-%m-%dT%H:%M:%SZ` (workflow scripts cannot call `Date.now()`). `sprint.root` is the absolute repo root (`git rev-parse --show-toplevel`) — added at launch, never stored in the plan, because it differs per machine; agents in isolated worktrees use it to reach the primary checkout's ledger. The two resume arrays are derived by replaying `status.jsonl`: a task id with a `task_done` event is completed (unless a later `wave_merged` lists it as failed), an epic id with an `epic_review` event is completed. On a fresh run both are empty.

## Validation before launch

Run these checks and refuse to launch on any failure — a malformed plan burns an unattended run:

1. JSON parses; every required field above present.
2. Every `specPath` and `readmePath` exists on disk and is non-empty.
3. Task ids unique; every `deps`/`dependsOn`/`conflictsWith` reference resolves (no forward-into-a-parallel-epic or dangling references); cross-epic task deps only into epics declared in `dependsOn`.
4. Task sizing passes the smell test from SKILL.md (no confetti, no mega-tasks) — warn rather than silently launch.
5. `git rev-parse --verify <baseBranch>` succeeds.

## Ledger event vocabulary (`status.jsonl`)

One JSON object per line. Agents append; nothing rewrites. Core events the executor's prompts mandate:

```jsonl
{"ts":"<utc>","actor":"preflight","event":"sprint_started","run":"…"}
{"ts":"<utc>","actor":"E01-T01","event":"task_started"}
{"ts":"<utc>","actor":"E01-T01","event":"task_done","summary":"…","files":[],"tests":[],"decisions":[],"insights":[],"questions":[]}
{"ts":"<utc>","actor":"E01-T02","event":"task_failed","summary":"…"}
{"ts":"<utc>","actor":"E01-merge","event":"wave_merged","integrated":["E01-T01"],"failed":[]}
{"ts":"<utc>","actor":"E01-review","event":"epic_review","verdict":"clean|repaired|failed","fixes":[],"risks":[]}
{"ts":"<utc>","actor":"sprint-review","event":"sprint_review","verdict":"…"}
{"ts":"<utc>","actor":"gate","event":"gate_round","round":1,"green":true}
{"ts":"<utc>","actor":"docs-sync","event":"docs_synced","files":[]}
{"ts":"<utc>","actor":"ship","event":"sprint_completed","commits":24,"insertions":1180,"deletions":642,"green":true}
```

`decisions` entries are how the operator finds out what agents chose autonomously; `questions` are assumptions where the operator's input would have changed the choice — both surface on the dashboard's Decisions & Questions view and in the completion report, so agents should write them as self-explanatory sentences.
