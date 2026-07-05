export const meta = {
  name: 'autosprint-executor',
  description: 'Executes an approved Autosprint plan: tasks in dependency waves (sequential or parallel via worktrees), per-task commits, an autonomous review at the end of every epic, green completion gates, docs sync, then completion report and PR.',
  whenToUse: 'Launched by the autosprint skill (launch mode) with a validated sprint plan as args. Not intended for direct ad-hoc invocation.',
  phases: [
    { title: 'Preflight', detail: 'branch, baseline checks, ledger init' },
    { title: 'Ship', detail: 'final review, green gate, docs sync, report, PR' },
  ],
}

// ---------------------------------------------------------------------------
// args contract (built and validated by the skill's launch mode — see
// references/sprint-plan-schema.md in the autosprint skill):
// {
//   sprint: { id, title, goal, folder, branch, baseBranch, root },  // root = absolute repo path
//   startedAt: 'ISO timestamp',            // scripts cannot call Date.now()
//   parallelism: 'minimal' | 'moderate' | 'max',   // operator's choice at plan time
//   models: { simple, standard, complex, review },  // operator's choice at plan time; null → inherit
//   codex: { model: '<codex model id>', reasoningEffort: 'low|medium|high' },
//   checks: { targeted: '<cmd or null>', global: '<cmd or null>' },
//   pr: { create: true, base: 'main', draft: true },
//   docs: { sync: true },
//   epics: [{ id, title, theme, readmePath, dependsOn: [], tasks: [{ id, title, specPath,
//             complexity: 'simple'|'standard'|'complex', engine: 'claude'|'codex',
//             codexModel: '<optional>', deps: [], conflictsWith: [] }] }],
//   completedTaskIds: [], completedEpicIds: [],     // non-empty when resuming
// }
// ---------------------------------------------------------------------------

const S = args.sprint
const MODELS = args.models || {}
const CHECKS = args.checks || {}
const PR = args.pr || { create: false }
const PARALLELISM = args.parallelism || 'minimal'
const WIDTH = { minimal: 1, moderate: 3, max: 8 }[PARALLELISM] || 1
const EPICS_PARALLEL = PARALLELISM === 'max'
const ROOT = S.root || '.'
const LEDGER = `${ROOT}/${S.folder}/status.jsonl`

// --- report schemas ---------------------------------------------------------

const TASK_REPORT = {
  type: 'object',
  required: ['taskId', 'status', 'summary'],
  properties: {
    taskId: { type: 'string' },
    status: { type: 'string', enum: ['done', 'done_with_concerns', 'failed', 'blocked'] },
    commits: { type: 'array', items: { type: 'string' }, description: 'SHAs of every commit made, oldest first' },
    summary: { type: 'string', description: 'What was delivered, in plain sentences' },
    filesChanged: { type: 'array', items: { type: 'string' } },
    testsRun: { type: 'array', items: { type: 'string' }, description: 'command — PASS/FAIL' },
    decisions: { type: 'array', items: { type: 'string' }, description: 'Choices made without a human, and why' },
    insights: { type: 'array', items: { type: 'string' }, description: 'Warnings or patterns for later agents' },
    questions: { type: 'array', items: { type: 'string' }, description: 'Assumptions the operator should review' },
  },
}

const MERGE_REPORT = {
  type: 'object',
  required: ['integrated'],
  properties: {
    integrated: { type: 'array', items: { type: 'string' }, description: 'task ids whose commits landed on the sprint branch' },
    failedIntegration: { type: 'array', items: { type: 'string' }, description: 'task ids whose commits could not be integrated' },
    summary: { type: 'string' },
    decisions: { type: 'array', items: { type: 'string' } },
  },
}

const EPIC_REVIEW = {
  type: 'object',
  required: ['epicId', 'verdict', 'summary'],
  properties: {
    epicId: { type: 'string' },
    verdict: { type: 'string', enum: ['clean', 'repaired', 'failed'] },
    fixesApplied: { type: 'array', items: { type: 'string' } },
    tasksAtRisk: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    risks: { type: 'array', items: { type: 'string' } },
  },
}

const GATE_REPORT = {
  type: 'object',
  required: ['green', 'summary'],
  properties: {
    green: { type: 'boolean', description: 'global checks pass (ignoring failures preflight recorded as pre-existing)' },
    summary: { type: 'string' },
    fixed: { type: 'array', items: { type: 'string' } },
  },
}

const DOCS_REPORT = {
  type: 'object',
  required: ['summary'],
  properties: { updated: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' } },
}

const SHIP_REPORT = {
  type: 'object',
  required: ['reportPath'],
  properties: {
    reportPath: { type: 'string' },
    prUrl: { type: 'string' },
    stats: { type: 'string' },
    outstanding: { type: 'array', items: { type: 'string' } },
  },
}

// --- shared discipline -------------------------------------------------------
// Injected into every coding agent. These are the rules unattended runs live or die by.
const WORKER_RULES = `
Ground rules for this sprint (they exist because no human is watching this run):
- Autonomy: no agent in this run may wait on a human. Never ask the operator a
  question mid-run — decide, record it in the ledger (as a decision, or a question
  for later review), and keep moving. A wrong-but-documented assumption beats a
  stalled run; if you truly cannot proceed, report "blocked" with the reason.
- Simplicity: do the simplest thing that works well. Do not add features, abstractions,
  error handling, or validation beyond what the task requires. The least amount of
  correct code is the goal. When your change replaces existing code, delete the code
  it replaces — leaving both paths alive is a defect, not a courtesy.
- Honesty: before reporting, audit each claim against a command result from this
  session. Report only work you can point to evidence for; if something is
  unverified, say so. If tests fail, report the failure — never mark a task done
  with an unverified acceptance criterion. Never delete, weaken, skip, or hardcode
  a test to make it pass; if a test itself is wrong, say so in your report instead
  of working around it.
- Scope: stay inside your assigned scope. Never run git add -A or git add . —
  stage only the specific files you changed. Do not push unless your prompt says to.
- Ledger: append events to ${LEDGER} (absolute path — use it as-is even if your
  working directory is elsewhere; one JSON object per line, append-only, e.g.
  printf '%s\\n' '<json>' >> ${LEDGER}). Do not stage or commit the ledger; it is
  committed at review points. Get timestamps with: date -u +%Y-%m-%dT%H:%M:%SZ
- Attribution: commits and PRs carry no AI attribution — no "Generated with" lines,
  no AI co-author trailers. The work ships under the repository's own conventions.
- If the task as written is infeasible or its spec contradicts the code you find,
  do the bounded honest version, mark status "blocked" or "done_with_concerns",
  and explain — do not work around it silently.`

// --- prompts -----------------------------------------------------------------

function implementerPrompt(epic, task, inWorktree) {
  const cx = args.codex || {}
  const cxModel = task.codexModel || cx.model
  const cxFlags = `${cxModel ? ` -m ${cxModel}` : ''}${cx.reasoningEffort ? ` -c model_reasoning_effort=${JSON.stringify(cx.reasoningEffort)}` : ''}`
  const codexLane = task.engine === 'codex' ? `
Engine: this task is routed to Codex CLI. You are the supervisor, Codex writes the code:
1. Run: codex exec --cd "$(git rev-parse --show-toplevel)" -s workspace-write -a never${cxFlags} \\
     -o /tmp/codex-${task.id}.md "$(cat ${task.specPath})"
   If the codex binary crashes or loses network under the shell sandbox, retry the
   same Bash call with sandbox disabled (dangerouslyDisableSandbox). If codex still
   cannot run or its usage limit is hit, implement the task yourself and record the
   fallback as a decision in your report and the ledger.
2. Review the resulting diff against the spec yourself. For bounded corrections use:
   codex exec resume --last "fix: <instruction>"  (at most 2 correction rounds; after
   that, fix the remainder directly.)
3. You own the commit, the tests, the ledger entry, and the report — not Codex.` : ''

  const worktreeNote = inWorktree ? `
Isolation: you are running in your own git worktree (your working directory) on a
private branch. Other tasks are running in parallel in their own worktrees — you will
never see their changes and must not look for them. Implement and commit here as
normal; after your wave completes, an integration agent cherry-picks your commits
onto the sprint branch. Because of that: report the SHA of every commit you make
(git log --format=%H), and remember the ledger path above is absolute — append
there, never to a copy inside your worktree.` : ''

  return `You are the implementer for one task of sprint "${S.id}: ${S.title}" (epic ${epic.id}: ${epic.title}).

Read, in order — this is your full context and it is deliberately layered:
1. Project guidance (CLAUDE.md / AGENTS.md) if present.
2. The Goal section of ${S.folder}/sprint.md — what this sprint is trying to ship.
3. Your epic's overview: ${epic.readmePath || `${S.folder}/epics/${epic.id}`} — why this
   epic exists and how your task connects to its siblings.
4. Your task spec: ${task.specPath} — problem, context, solution direction, definition
   of done, test plan, required skills. Load the skills it names.
5. The last ~40 lines of ${LEDGER} — earlier agents' decisions and insights apply to you.

Work in this shape:
1. The spec is a map; the code is the territory. Do your own targeted research first
   to verify the spec's references and assumptions against the current code. Where they
   diverge, trust the territory and record the deviation as a decision.
2. Write yourself a short task list, then implement.
3. Verify with the spec's test plan, then report.
${worktreeNote}${codexLane}
Deliver:
- The implementation, with targeted tests from the spec's test plan run and passing
  (or failures honestly reported).
- Ledger events appended to ${LEDGER}:
  {"ts":"<utc>","actor":"${task.id}","event":"task_started"}
  {"ts":"<utc>","actor":"${task.id}","event":"task_done|task_failed|task_blocked","summary":"...","files":[...],"tests":[...],"decisions":[...],"insights":[...],"questions":[...]}
  ("questions" = things where the operator's input would have changed your choice —
  you proceeded with a documented assumption, but flag it for their review.)
- Exactly one commit: message "[${S.id}/${task.id}] ${task.title}" with a body listing
  what changed and why. Stage only the files you changed. If you changed nothing
  (blocked), commit nothing.
${WORKER_RULES}

Your final message is parsed by an orchestration script, not read by a human — return
the structured report and nothing else.`
}

function mergePrompt(epic, waveReports) {
  const picks = waveReports
    .filter(r => r && (r.status === 'done' || r.status === 'done_with_concerns') && r.commits && r.commits.length)
    .map(r => `${r.taskId}: ${r.commits.join(', ')}`)
  return `You are the integration agent for a parallel wave of epic ${epic.id} in sprint "${S.id}".
You work in the primary checkout at ${ROOT} on branch ${S.branch}. The wave's tasks ran
in isolated worktrees; land their commits here, in this order:
${picks.join('\n')}

For each task, in order: git cherry-pick each of its SHAs (oldest first). The plan
declared these tasks' file scopes disjoint, so conflicts should be rare; when one
happens anyway, resolve it minimally, honoring both tasks' specs, and record the
resolution as a decision. If a task's commits cannot be integrated coherently,
git cherry-pick --abort, skip that task's remaining commits, and list it in
failedIntegration — do not force broken code onto the branch.

This is integration only: do not refactor, improve, or re-implement anything.
${CHECKS.targeted ? `After all picks, run: ${CHECKS.targeted} — report failures honestly.` : ''}
Append one ledger event: {"ts":"<utc>","actor":"${epic.id}-merge","event":"wave_merged","integrated":[...],"failed":[...]}
${WORKER_RULES}
Return the structured report only.`
}

function epicReviewPrompt(epic, taskReports) {
  return `You are the epic reviewer for epic ${epic.id}: "${epic.title}" of sprint "${S.id}: ${S.title}".
No human reviews this work before you — you are the quality gate, and you are trusted
to fix what you find. You work in the primary checkout at ${ROOT} on branch ${S.branch}.

Inputs:
- Epic overview: ${epic.readmePath || `${S.folder}/epics/${epic.id}`} (includes the epic-level definition of done)
- Task specs: ${epic.tasks.map(t => t.specPath).join(', ')}
- Task reports from the agents that just ran: ${JSON.stringify(taskReports)}
- Commits: git log --oneline ${S.baseBranch}..HEAD — study the actual diffs (git show)
  for this epic's task ids, not just the reports.
- Ledger: ${LEDGER} (decisions and concerns recorded during the epic).

Audit every task against its spec, and the epic against its README, on four dimensions:
1. Correctness — does the implementation actually solve the spec's problem?
2. Completeness of removal — did replaced/dead code get deleted, or do two code paths coexist?
3. Defects — bugs, broken edge cases, regressions in touched areas (run the targeted checks: ${CHECKS.targeted || 'the test commands named in the specs'}).
4. Excess — code beyond what the spec required; simplify where the reduction is safe and clearly better.
${WIDTH > 1 ? '5. Seams — tasks in this epic ran in parallel; look specifically at the boundaries between their changes (shared call sites, duplicated helpers, inconsistent naming across tasks).' : ''}

Fix what you find, autonomously, within bounds: corrections and deletions yes,
redesigns no. If a task's approach is fundamentally wrong, revert or repair to the
most useful honest state and mark it in tasksAtRisk rather than papering over it.
Commit your fixes plus the current ledger as one commit: "[${S.id}/${epic.id}-review] <summary>".
Append an epic_review ledger event with your verdict, fixes, and risks.
${WORKER_RULES}

Verdict meanings: clean = ship as-is; repaired = issues found and fixed; failed = epic
does not deliver its theme even after repair (dependent epics will be skipped).
Your final message is parsed by a script — return the structured report only.`
}

// --- model routing ------------------------------------------------------------

const routeModel = (complexity) => {
  const m = { simple: MODELS.simple, standard: MODELS.standard, complex: MODELS.complex }[complexity]
  return m ? { model: m } : {}
}
const reviewModel = MODELS.review ? { model: MODELS.review } : {}

// --- main-tree lock: all primary-checkout git operations serialize through this.
// Parallel task agents run in isolated worktrees, but merges, reviews, and gates
// mutate the shared branch and must never interleave.
let treeLock = Promise.resolve()
const withTree = (fn) => { const run = treeLock.then(fn); treeLock = run.then(() => {}, () => {}); return run }

// --- Preflight -----------------------------------------------------------------
phase('Preflight')
const hasCodex = args.epics.some(e => e.tasks.some(t => t.engine === 'codex'))
const preflight = await agent(`Preflight for autosprint "${S.id}: ${S.title}" (started ${args.startedAt}, parallelism: ${PARALLELISM}).
Repo root: ${ROOT}. Sprint folder: ${S.folder}. Verify, fixing what is safely fixable and reporting the rest:
1. Current branch is ${S.branch} (create from ${S.baseBranch} and switch if needed); working tree has no unrelated uncommitted changes (untracked files outside ${S.folder} are fine — leave them alone).
2. Baseline: run ${CHECKS.global || 'the project typecheck/test command if one is discoverable'} and record pre-existing failures in the ledger so later agents are not blamed for them.
3. ${hasCodex ? 'Run codex login status — this sprint routes tasks to Codex CLI.' : 'No Codex tasks in this sprint; skip Codex checks.'}
4. Ensure ${LEDGER} exists and append: {"ts":"<utc>","actor":"preflight","event":"sprint_started","run":"<short note>"}.
Return JSON: {"ok": true|false, "reason": "...", "baseline": "..."}. ok:false only for conditions that doom the run (wrong repo, branch conflict, dirty tree that cannot be safely stashed).`,
  { label: 'preflight', schema: { type: 'object', required: ['ok'], properties: { ok: { type: 'boolean' }, reason: { type: 'string' }, baseline: { type: 'string' } } } })

if (!preflight || !preflight.ok) {
  return { aborted: true, stage: 'preflight', reason: preflight ? preflight.reason : 'preflight agent did not return' }
}

// --- Epics -----------------------------------------------------------------------
const done = new Set(args.completedTaskIds || [])
const failed = new Set()
const epicResults = []

function nextWave(queue) {
  const wave = []
  for (const t of queue) {
    if (wave.length >= WIDTH) break
    const deps = t.deps || []
    if (deps.some(d => failed.has(d))) continue            // handled by caller as a skip
    if (!deps.every(d => done.has(d))) continue            // not ready yet
    const conflicts = (a, b) => (a.conflictsWith || []).includes(b.id) || (b.conflictsWith || []).includes(a.id)
    if (wave.some(w => conflicts(t, w))) continue
    wave.push(t)
  }
  return wave
}

async function runEpic(epic) {
  const phaseTitle = `${epic.id}: ${epic.title}`
  const taskReports = []
  const queue = epic.tasks.filter(t => !done.has(t.id))

  while (queue.length) {
    // Drop tasks whose dependencies have terminally failed.
    for (const t of [...queue]) {
      const dead = (t.deps || []).filter(d => failed.has(d))
      if (dead.length) {
        queue.splice(queue.indexOf(t), 1)
        failed.add(t.id)
        taskReports.push({ taskId: t.id, status: 'skipped', summary: `dependency failed: ${dead.join(', ')}` })
        log(`${t.id} skipped — depends on failed task(s): ${dead.join(', ')}`)
      }
    }
    if (!queue.length) break

    const wave = nextWave(queue)
    if (!wave.length) {
      for (const t of queue) {
        failed.add(t.id)
        taskReports.push({ taskId: t.id, status: 'skipped', summary: 'unresolvable dependencies (plan error)' })
      }
      log(`${epic.id}: remaining tasks have unresolvable dependencies — skipped: ${queue.map(t => t.id).join(', ')}`)
      break
    }
    wave.forEach(t => queue.splice(queue.indexOf(t), 1))

    // Parallel waves isolate in worktrees; a solo wave edits the primary tree directly —
    // unless epics themselves run in parallel, in which case the primary tree is never
    // safe for task agents.
    const useWorktree = EPICS_PARALLEL || wave.length > 1

    const run = () => parallel(wave.map(task => () =>
      agent(implementerPrompt(epic, task, useWorktree), {
        label: task.id,
        phase: phaseTitle,
        schema: TASK_REPORT,
        ...routeModel(task.complexity),
        ...(task.complexity === 'simple' ? { effort: 'medium' } : {}),
        ...(useWorktree ? { isolation: 'worktree' } : {}),
      })
    ))
    const waveReports = await (useWorktree ? run() : withTree(run))

    const normalized = wave.map((task, i) => waveReports[i] || { taskId: task.id, status: 'failed', summary: 'agent died or was skipped' })

    if (useWorktree) {
      const anyLanded = normalized.some(r => (r.status === 'done' || r.status === 'done_with_concerns') && r.commits && r.commits.length)
      const merge = anyLanded
        ? await withTree(() => agent(mergePrompt(epic, normalized), {
            label: `${epic.id}-merge`, phase: phaseTitle, schema: MERGE_REPORT,
            ...(MODELS.standard ? { model: MODELS.standard } : {}),
          }))
        : { integrated: [], failedIntegration: [] }
      const landed = new Set((merge && merge.integrated) || [])
      for (const r of normalized) {
        const ok = (r.status === 'done' || r.status === 'done_with_concerns') && landed.has(r.taskId)
        if (ok) done.add(r.taskId)
        else { failed.add(r.taskId); if (r.status === 'done' || r.status === 'done_with_concerns') r.status = 'failed_integration' }
        taskReports.push(r)
        log(`${r.taskId} → ${r.status}`)
      }
      if (merge && merge.failedIntegration && merge.failedIntegration.length) log(`${epic.id} merge: failed to integrate ${merge.failedIntegration.join(', ')}`)
    } else {
      for (const r of normalized) {
        if (r.status === 'done' || r.status === 'done_with_concerns') done.add(r.taskId)
        else failed.add(r.taskId)
        taskReports.push(r)
        log(`${r.taskId} → ${r.status}`)
      }
    }
  }

  if ((args.completedEpicIds || []).includes(epic.id)) {
    return { epicId: epic.id, verdict: 'clean', summary: 'reviewed in a previous run' }
  }

  const review = await withTree(() => agent(epicReviewPrompt(epic, taskReports), {
    label: `${epic.id}-review`, phase: phaseTitle, schema: EPIC_REVIEW, effort: 'high', ...reviewModel,
  }))
  log(`${epic.id} review → ${review ? review.verdict : 'missing'}`)
  return review || { epicId: epic.id, verdict: 'failed', summary: 'review agent did not return' }
}

// Epic scheduling: sequential by default; under max parallelism, independent epics
// (grouped into dependency levels) run concurrently.
let epicLevels
if (EPICS_PARALLEL) {
  epicLevels = []
  const placed = new Set()
  let rest = [...args.epics]
  while (rest.length) {
    const level = rest.filter(e => (e.dependsOn || []).every(d => placed.has(d)))
    if (!level.length) { epicLevels.push(rest); break }   // dangling/cyclic deps → run remainder as one sequential level
    epicLevels.push(level)
    level.forEach(e => placed.add(e.id))
    rest = rest.filter(e => !level.includes(e))
  }
} else {
  epicLevels = args.epics.map(e => [e])
}

for (const level of epicLevels) {
  const runnable = []
  for (const epic of level) {
    const blockedBy = (epic.dependsOn || []).filter(id => {
      const r = epicResults.find(x => x.epicId === id)
      return !r || r.verdict === 'failed' || r.verdict === 'skipped' || r.verdict === 'parked'
    })
    if (blockedBy.length) {
      log(`Skipping ${epic.id} — depends on failed/parked epic(s): ${blockedBy.join(', ')}`)
      epicResults.push({ epicId: epic.id, verdict: 'skipped', summary: `dependency not delivered: ${blockedBy.join(', ')}` })
      continue
    }
    if (budget.total && budget.remaining() < 60_000) {
      log(`Token target nearly spent — parking ${epic.id} for a resume run.`)
      epicResults.push({ epicId: epic.id, verdict: 'parked', summary: 'token budget exhausted' })
      continue
    }
    runnable.push(epic)
  }
  if (!runnable.length) continue
  const results = await parallel(runnable.map(epic => () => runEpic(epic)))
  runnable.forEach((epic, i) => epicResults.push(results[i] || { epicId: epic.id, verdict: 'failed', summary: 'epic runner did not return' }))
}

// --- Ship --------------------------------------------------------------------------
phase('Ship')

const finalReview = await withTree(() => agent(`You are the sprint-level reviewer for autosprint "${S.id}: ${S.title}".
Every epic has already had its own review; your job is what per-epic reviews cannot see:
cross-epic integration. You work in the primary checkout at ${ROOT} on branch ${S.branch}.
Read ${S.folder}/sprint.md for the goal, then review the whole diff
(git diff ${S.baseBranch}...HEAD, excluding ${S.folder}) for: pieces that do not fit
together, duplicated logic introduced by different epics, and violations of the sprint's
non-goals. Fix bounded integration issues and commit as "[${S.id}/sprint-review] <summary>".
Append a sprint_review ledger event to ${LEDGER}.
Epic results so far: ${JSON.stringify(epicResults)}
${WORKER_RULES}
Return the structured report only.`,
  { label: 'sprint-review', schema: EPIC_REVIEW, effort: 'high', ...reviewModel }))

// Green gate: the sprint does not ship red. Bugs may exist, but the code must run —
// build/typecheck/tests green, modulo failures preflight recorded as pre-existing.
let gate = null
for (let round = 1; round <= 3; round++) {
  gate = await withTree(() => agent(`You are the completion gate (round ${round}/3) for autosprint "${S.id}".
Working in ${ROOT} on branch ${S.branch}. Run the global checks: ${CHECKS.global || 'build, typecheck, and test commands discoverable from the project'}.
Compare failures against the pre-existing failures preflight recorded in ${LEDGER}.
green = every failure that exists was already failing before this sprint started.
If sprint-caused failures exist: fix them, bounded and honest (no test weakening — if a
sprint change legitimately obsoleted a test, update it to test the new behavior and say so),
commit as "[${S.id}/gate-${round}] <summary>", re-run the checks, and report the final state.
Append a ledger event: {"ts":"<utc>","actor":"gate","event":"gate_round","round":${round},"green":<bool>}.
${WORKER_RULES}
Return the structured report only.`,
    { label: `gate-${round}`, schema: GATE_REPORT, effort: 'high', ...reviewModel }))
  if (!gate) { gate = { green: false, summary: 'gate agent did not return' }; break }
  if (gate.green) break
  log(`Gate round ${round}: not green yet — ${gate.summary}`)
}

const docsReport = (args.docs && args.docs.sync === false) ? { summary: 'docs sync disabled' } :
  await withTree(() => agent(`You are the documentation-sync agent for autosprint "${S.id}: ${S.title}".
Working in ${ROOT} on branch ${S.branch}. The sprint's delivered changes: git diff ${S.baseBranch}...HEAD --stat (excluding ${S.folder}), plus epic results ${JSON.stringify(epicResults.map(e => ({ id: e.epicId, verdict: e.verdict })))}.
Review README.md, CLAUDE.md, AGENTS.md, and docs/ (where they exist) strictly against
what this sprint changed: stale commands, renamed modules, new behavior worth a section,
removed features still documented. Update only what the sprint made wrong or incomplete —
this is not a docs rewrite. If nothing is stale, change nothing.
Commit updates as "[${S.id}/docs] sync documentation". Append a docs_synced ledger event listing files updated.
${WORKER_RULES}
Return the structured report only.`,
    { label: 'docs-sync', schema: DOCS_REPORT, ...(MODELS.standard ? { model: MODELS.standard } : {}) }))

const ship = await withTree(() => agent(`You are the shipping agent for autosprint "${S.id}: ${S.title}".
Working in ${ROOT} on branch ${S.branch}.
Inputs: ${S.folder}/sprint.md, ${S.folder}/verification-guide.md, the full ledger ${LEDGER},
epic results ${JSON.stringify(epicResults)}, final review ${JSON.stringify(finalReview)},
completion gate ${JSON.stringify(gate)}, docs sync ${JSON.stringify(docsReport)}.

1. Write ${S.folder}/completion-report.md — the document a human engineer reads first:
   sprint goal; what was delivered vs planned (per epic: delivered / repaired / failed /
   parked); completion-gate status (green or not, and why); stats from git (commit count,
   files changed, insertions/deletions via git diff --shortstat ${S.baseBranch}...HEAD);
   every decision agents made autonomously and every question they flagged (from ledger,
   consolidated); known issues and tasksAtRisk; what the human verifier should focus on
   first. Plain sentences — the reader was not present.
2. Update ${S.folder}/verification-guide.md if delivered scope deviated from plan.
3. Append: {"ts":"<utc>","actor":"ship","event":"sprint_completed", "commits":N, "insertions":N, "deletions":N, "green":<gate green>}.
4. Commit the sprint folder updates (including the ledger): "[${S.id}/ship] completion report".
${PR.create ? `5. Push the branch and open a ${PR.draft ? 'draft ' : ''}PR against ${PR.base || S.baseBranch} with gh pr create.
   Structure the body in two sections, because it has two audiences:
   "## For reviewers" — goal; epic-by-epic summary; a criteria→evidence table mapping
   each epic's definition of done to the command output or test that proves it;
   consolidated decisions and open questions; link to ${S.folder}/verification-guide.md;
   known issues.
   "## For agents" — structured intent, constraints, edge cases, and scope boundaries,
   written so a future agent session working on this code can reason from it.
   No AI attribution anywhere in the body or title.` : '5. Do NOT push or open a PR — the operator will do that.'}
${WORKER_RULES}
Return the structured report only.`,
  { label: 'ship', schema: SHIP_REPORT, ...reviewModel }))

return {
  sprint: S.id,
  parallelism: PARALLELISM,
  preflightBaseline: preflight.baseline,
  epics: epicResults,
  finalReview,
  gate,
  docs: docsReport,
  ship,
  failedTasks: [...failed],
}
