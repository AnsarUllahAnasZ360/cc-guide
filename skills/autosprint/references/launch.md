# Launch mode — executing, monitoring, resuming

Launch mode takes an approved sprint and runs it: preflight questions, workflow launch, dashboard monitoring, completion handling. After launch the operator may be gone for hours — everything here is designed so that nothing needs them until the PR exists.

## Before launching

1. **Validate `sprint.json`** against `references/sprint-plan-schema.md` (all five checks). Refuse to launch on failure.
2. **Confirm what plan mode captured, fill only gaps.** Model routing (including any Codex model IDs) was asked and recorded during planning — don't re-ask unless it's missing or the operator says their limits changed. Still settle, and write back into `sprint.json`:
   - PR behavior (`pr.create`, draft or ready).
   - Dashboard target (below), if not already set.
   - Branch: executor preflight will create `sprint.branch` from `baseBranch` if needed, but if the operator is present, confirm the worktree is clean now — cheaper than a preflight abort.
3. **Codex tasks?** If any task has `engine: "codex"`, run the preflight in `references/codex-lane.md` first (login status, model ID sanity, permissions). If it fails, offer to re-route those tasks to `engine: "claude"` rather than launching a run that will limp.
4. **Token budget** — if the operator gave one (e.g. "+2m"), it applies automatically; the executor parks remaining epics when nearly spent and reports them for a resume run.

### Dashboard target

Two supported publish targets, chosen once and stored in `sprint.json` as `dashboard: { target: "artifact" | "r2", r2: { bucket, prefix, publicUrl } }`:

- **`artifact`** (default): deploy with the Artifact tool — same file path every redeploy so the URL stays stable, same favicon (🏃).
- **`r2`**: upload to the operator's Cloudflare R2 via wrangler:
  `wrangler r2 object put <bucket>/<prefix>/dashboard.html --file sprints/<id>/dashboard.html --content-type text/html --remote`
  Check `wrangler whoami` first; if unauthenticated, ask the operator to run `wrangler login` and to name the bucket/path — don't guess at their storage layout. The shareable URL is `publicUrl` (their bucket's public domain) + the object key; confirm it once with them at first publish.

## Launching

The operator launches with plain language — "launch the sprint at sprints/<id>", or just "launch it" right after plan approval. That's the whole interface; everything below is what you do with it.

Build args: parse `sprint.json`, add `startedAt` (`date -u +%Y-%m-%dT%H:%M:%SZ`), add `sprint.root` (`git rev-parse --show-toplevel` — absolute, machine-specific, never stored in the plan), add `completedTaskIds`/`completedEpicIds` (empty on a fresh run). If `parallelism` is missing from an older plan, it runs `minimal` — confirm with the operator rather than silently upgrading. Then invoke the Workflow tool with:

- `scriptPath`: `<this skill's base directory>/assets/executor.workflow.js`
- `args`: the built object — as a real JSON value, never a stringified blob

The workflow runs in the background and notifies on completion. Save the returned `runId` and script path in the ledger-adjacent note `sprints/<id>/run.json` (`{ runId, launchedAt, sessionNote }`) so a later session knows a run exists.

## Monitoring and the dashboard

The dashboard is a claude.ai artifact the operator refreshes from a phone — no terminal, no app. It renders entirely from the ledger.

Loop, from launch until the completion notification:

1. On each pass: read `sprints/<id>/status.jsonl`, inject its lines as a JSON array into `assets/dashboard.html` (replace the `__SPRINT_EVENTS__` placeholder; `__SPRINT_META__` gets `{id, title, goal, startedAt, epics:[{id, title, tasks:[{id, title, complexity, engine}]}]}` built from `sprint.json`), write to `sprints/<id>/dashboard.html`, and publish to the configured dashboard target. First publish: give the operator the URL and say it will keep updating in place.
2. Sleep with ScheduleWakeup, ~1500–1800s ("refreshing sprint dashboard"). Epic cadence is tens of minutes; polling faster buys nothing.
3. Between wakeups, if the workflow errored or stalled (no new ledger events across two consecutive wakeups and the run is not alive per TaskOutput), treat it as an interrupted run — see Resume.

On the completion notification: final dashboard deploy, then read the workflow's return value and report to the operator: epic verdicts, failed/parked tasks, PR URL, completion-report path, and — always — anything the run decided autonomously that they'd want to know. If a push-notification tool is available, send one line: sprint finished, verdict, PR link.

## Resume

Resume never depends on the dead session or the workflow journal — the ledger is the source of truth. In a fresh session:

1. Read `sprint.json`, `run.json`, and `status.jsonl`.
2. Derive `completedTaskIds` (tasks with `task_done`) and `completedEpicIds` (epics with `epic_review`). A task with `task_started` but no terminal event was mid-flight: check `git log` for its commit — commit present means treat as done (the epic reviewer will audit it anyway); absent means it re-runs. Reset its partial working-tree changes only if `git status` shows conflicts with a clean re-run.
3. Relaunch the executor with those arrays populated. Completed work is skipped; reviews re-run only for unreviewed epics.
4. Resume the monitoring loop.

This same procedure is the answer to "what's the sprint status?" from any session: read the ledger, refresh the dashboard, summarize — steps 1 and 4 only.

## Failure semantics (what the operator should expect)

- A failed task doesn't stop anything except tasks that declared it in `deps`; a parallel task whose commits can't be integrated is failed by the merge agent, not forced onto the branch.
- A failed epic review skips only epics that declared it in `dependsOn`.
- Nothing in the run ever waits on a human: agents decide, record decisions and questions in the ledger, and keep moving — that rule is in every prompt precisely because the operator launches and leaves.
- The run does not ship red: after the sprint review, a completion gate re-runs the global checks and repairs sprint-caused failures (up to 3 rounds). Bugs may ship — that's what human verification is for — but the code builds, typechecks, and passes its suites (modulo failures preflight recorded as pre-existing), or the report says so in its first lines. A docs-sync agent then trues up README/CLAUDE.md/AGENTS.md/docs against what changed.
- Whatever happens, the run ends with a completion report and (if enabled) a PR — a partial sprint ships its surviving epics with an honest account of the rest. There is deliberately no state where hours of completed work sit unreported because something later broke.
