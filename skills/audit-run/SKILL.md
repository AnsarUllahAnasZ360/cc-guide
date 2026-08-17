---
name: audit-run
description: The full audit→fix cycle for Millwork OS production runs — invoke with a run/chat URL (or thread id) plus the requester's brain-dump of observations. Use whenever the user says "audit this run", pastes a millos.ai chat URL with complaints, asks why a run was slow/wrong/expensive, or says "execute the audit findings". Covers evidence collection (checkpoints, Langfuse, DB, VFS artifacts, Vercel/Railway logs), cost+time accounting, two-persona judgment, problem documentation, the fix plan with execution lanes, and — after approval — the agent-team execution, verification loop, build gate, PR, and optional live verification + deployment.
---

# The audit→fix cycle

One cycle: a run finishes → the requester observes something → you audit and root-cause → you document problems and a fix plan with an execution order → the requester challenges and agrees → you execute with agent teams at the requester's chosen level → verified PR (→ optionally live-verified → optionally deployed). This skill carries the whole loop. **Honesty over confidence: every claim carries evidence or is labeled unverified. Thorough and correct beats fast.**

## Inputs

- A chat URL (`https://millos.ai/<ws>/projects/<slug>/chats/<slug>`), thread id, or fragment.
- The requester's observations, verbatim. Treat each as a question to answer with evidence — they are symptoms of deeper mechanisms, and sometimes wrong in an informative way. Verify counts and claims independently; report corrections plainly.
- Optionally an answer key (grading is scope + takeoff ONLY, never dollars — founder doctrine). Answer keys are grader-only and arrive out-of-band: they live outside the repo (prime directive D1), are never committed, and no ground-truth value from one is ever copied into the packet, a problem file, code, or a prompt.

## Operating rules

- Read-only against every source during the AUDIT phases. Never start/stop dev processes you did not start yourself. Nothing is implemented before plan approval.
- **Access tiers.** Auditing a PROD run requires Railway access to the `langgraph-server` service (the `railway run` wrapper below injects the prod DB URL, prod Langfuse keys, and provider keys — you never handle those values directly). Without that access, audit runs on your local/dev stack: the repo `.env.local` already carries the DEV Langfuse keys, and every command below works the same minus the wrapper. Never ask anyone to paste prod keys, and never copy any key into the packet.
- Work through CLIs in the terminal (railway, vercel, gh, npx langfuse-cli, curl), not MCPs.
- Orchestrate: delegate mechanical evidence-collection and, later, implementation to agents; keep judgment (personas, rubric, root-cause verdicts, bundling decisions) yourself. Verify agents' claims against tool results before repeating them.
- Bank findings to a scratchpad file continuously (survives compaction).
- `docs/` is gitignored — the audit packet lives in `docs/audits/<slug>/` and never gets committed; the PR carries code only.
- When a behavior looks like the model ignoring its prompt, check EVERY instruction channel before blaming the model: the Langfuse `production` prompts, skills, workspace/project memory, AND wire-injected suffixes in the lane adapters (`chat-kimi.ts` and friends) — hidden channels have overridden canon prompts before.
- When a model misbehaves on one provider lane, suspect the LANE before the model: capture the actual wire (point the adapter at a local echo server), read the provider's docs AND the model vendor's docs, and settle divergences with small live probes (a fact recallable only through the disputed mechanism is a decisive probe shape). Preserve probe scripts' outputs in the packet, then delete the scripts.

## Phase 1 — identity and evidence (parallelizable across agents)

1. **Resolve the run**: `pnpm audit:run "<url>" --out docs/audits/<slug>/technical.md` under the prod wrapper (below) for prod runs, or plain for local runs. CAUTION: its non-DB probes have false-negatived on prod — ALWAYS re-verify custody directly from `hitl_prompts` + `estimate/line-items/approval.json` before repeating any custody verdict, and treat "0 dispatches"-style zeros as "source unreachable" until confirmed.
2. **Prod access pattern** (plain CLIs silently hit the local stack):
   ```bash
   railway run --service langgraph-server -- bash -c '<cmd using $SUPABASE_DB_URL / $LANGFUSE_* / provider keys>'
   ```
   - SQL: `pnpm --filter @millwork/langgraph-server exec node -e '…require("pg")…'` (no local psql). Schema gotchas: `agent_runs` has `started_at/ended_at/totals` (no `updated_at`); `model_call_usages` keys on `run_id` and carries `reasoning_tokens`; the store is `langgraph.store` (`namespace_path/key/value`).
   - Langfuse: session id = thread id. Never `traces/{id}` on heavy runs (500s over the size cap) — page `observations?traceId=…&type=GENERATION&limit=100&page=N`.
3. **The transcript** (behavioral ground truth): the LATEST root checkpoint's cumulative `messages` channel blob in `langgraph.checkpoint_blobs` (root ns `''`) survives pruning and is complete; subagent namespaces `tools:<uuid>` hold expert tails; `langgraph.checkpoint_writes` holds mid-super-step truth. Durable expert transcripts: VFS `project-files/runs/task:NN/messages.json`. A limit-killed expert has neither — check checkpoint_writes early.
4. **Artifacts**: dump the project VFS (select `project_files` rows by project id; download via service-role storage client; include binaries). Read: ledger, workbook, questions, approval record, worklist, `solves/` (churn = retry fights), brief, scope plan, sheets index + digest, pricing summary.
5. **The bid package**: read the PDF yourself — you cannot judge scope you haven't seen. Crop the rendered sheet PNGs for close looks at disputed elevations.
6. **Prompts as-run**: fetch the Langfuse `production`-labeled prompts; check updatedAt vs run time. Remember the wire-suffix channel too.
7. **Platform logs**: `vercel logs` (~24h rolling retention — capture SAME DAY; SSE timeouts log status 200 so never filter by 5xx; dedupe records by id) and `railway logs` for the run window.
8. **Memory check**: `langgraph.store` for workspace preferences that would legitimize observed behavior.

## Phase 2 — accounting (delegate to one agent)

Produce, with Langfuse↔DB reconciliation (vision spans are separate LF observations folded into the caller in the DB; aborted generations exist only in LF at $0):
- Per-agent: calls, new-input / cache-read / output / **reasoning** tokens, $, share. **Always pull reasoning_tokens per turn first** — a reasoning collapse is invisible in every other metric.
- Phase timeline from `tool.task` span edges (minutes must sum to wall clock); concurrency from span overlap + cold-cache first-calls (each subagent instance's first call has no cache-read — an exact instance counter).
- Gaps >90s with nothing in flight (distinguish human stops); count `level=ERROR` terminated generations.
- Latency shape per agent; money summary ($/agent-hour, cost as % of estimate value, top 3 concentrations).

## Phase 3 — behavior forensics (delegate to one agent; you judge)

From the master transcript: the kickoff message verbatim; every `task` dispatch (timestamp, wave grouping = same AI message, briefing quality, one FULL verbatim briefing); **reasoning-vs-emission mismatches** (reasoning plans N actions, tool_calls carries fewer); interrupt census vs `hitl_prompts`; the ending (ask-parked vs prose-drained; terminal todo state); tool errors and the model's response to each; narration presence at the prompt's required milestones.

## Phase 4 — two-persona judgment (yours, never delegated)

**Millwork estimator** (artifacts only, against your own read of the drawings): missed scope (closets/shelving hide in door-looking elevations), invented/double-counted scope (one wall split into two "walls"; counters longer than the base runs under them), measurement basis (printed > proven-scaled > provisional; unverified-scale exposure), pricing sanity (product-match quality, label contradictions like firm+price_needed, blank-vs-$0, tax, soft costs), question hygiene (open questions swept before delivery?). Verdict: what a real estimator fixes before sending, and how long that takes.

**Harness engineer**: where instruments fought correct work (retry loops, contract arguments, orientation tax), waste (barrier idle, aborted calls, false alarms), observability holes, frontend truth vs server truth, D9 posture (gates that should be named warnings; flags that accrete instead of reflecting current state).

## Phase 5 — document, plan, and get agreement

- `docs/audits/<slug>/audit.md`: the story (conceptual, one thing at a time, non-technical), accounting, the requester's questions answered, both personas, rubric (scope acc / measurement acc / pricing / communication / protocol / speed / cost / harness support; overall grade with reasoning), what was efficient (protect it), problem index.
- **One file per confirmed problem** in `problems/NN-slug.md`, written for a fresh implementing agent: title, exact issue + business problem, evidence (file:line, ids, verbatim quotes), technical detail, proposed solution (least code, delete what you replace, NO new gates/guards/validation engines — D9/D10), skills+references, binary definition of done. Unverified mechanisms are labeled OPEN with a probe plan. When later evidence corrects a file, correct it IN PLACE with a dated correction note.
- `fix-plan.md`: epics → tickets (each ticket points at its problem file) **plus the execution plan**: agent bundles, lanes, and order (next section's rules). Present in chat: findings story → plan → lanes. **STOP for the requester's feedback and agreement. Nothing is built before explicit approval — and a fix that adds a new subsystem or a new refusal path needs FOUNDER sign-off per D9/D10, whoever requested the audit.**

## Phase 6 — execution (only after plan approval)

**Orient, then ask the level.** When the requester says "execute", first build your complete execution picture (bundles, lanes, order — below), present a short overview ("here is how I'll run this"), then ask ONE question — which level:
1. **Implement**: execute + verify + build gate + PR; the requester tests manually.
2. **Implement + self-verify**: level 1, then compile/dev-server checks and a live browser/agent-run verification against every fix.
3. **End to end**: level 2, then production deployment. **Level 3 requires the founder's explicit ask — production deploys are never triggered on a teammate's own authority.**
The requester may also preempt the question ("just implement", "do the whole deal") — honor it, within the level-3 gate above.

**Bundling and lanes (your judgment, every time):**
- One agent = one coherent area of the codebase, carrying 1–3 tickets. Not so much that it loses the thread mid-flight; not so little that a fresh agent's orientation cost outweighs its work. Same-file tickets ALWAYS share an agent; cross-cutting tickets never do.
- Group into parallel waves by file-disjointness and dependency: wave 1 = independent areas simultaneously; wave 2 = work that composes with or touches wave-1 files. Sequential only where genuinely dependent.
- Every implementation agent's briefing is complete in itself: the ticket list, **the exact problem files to read first** (plus any deep-dive/probe documents for its area), repo conventions that bind it (build steps, patched-package rules, no-AI-attribution), what to produce, and what NOT to do (no tests, no verification, no scope creep).

**Execution mechanics:**
- Start from a clean tree; one branch (`fix/<slug>`), **one PR** at the end; **one commit per agent**, message listing what was done and why. NO AI attribution anywhere, ever.
- Implementation agents do NOT run tests and do NOT verify — implement, commit, and write a report to `docs/audits/<slug>/execution/<agent>-report.md`: what changed (file:line), how it satisfies each ticket's DoD, decisions taken, anything punted (flagged loudly).
- Prompt-lane work includes `prompts:snapshot`; agent-code work notes that `pnpm --filter @millwork/agents build` will be needed at the gate; patched-package work extends the existing patches in `patches/` and their guard tests (never a fresh fork).

**Verification loop (after all implementation lands):**
- One independent verifier agent per implementation agent. Each verifier receives: the same problem files, the implementer's report, and its commit. It audits the diff against each ticket's DoD, hunts for misses, regressions, and improvements, and FIXES what it finds in a follow-up commit (+ appends to the report). Verifiers may run targeted tests/typecheck.

**Build gate (always):**
- `pnpm --filter @millwork/agents build` (stale-dist trap) · web compile/dev-server boots · `pnpm lint && pnpm typecheck` · `pnpm test:all` before the PR · open the PR (body: what/why per epic, no AI attribution) · CI green. Then report: "ready for you to test" — unless a higher level was chosen.

**Live verification (level 2+):**
- Boot the stack, start a REAL run, and check for EVIDENCE of every fix in the live system (the fix-plan's DoDs are the checklist). Watch for new issues: in-scope and small → fix on the spot and note it; a NEW regression → STOP and report ("this is what happened — what would you like me to do?").

**Deployment (level 3 only, founder-gated):**
- Per canon: agent = `pnpm agent:build` / `agent:deploy`; web = the founder's explicit-ask deploy workflow only. After deploying, report: the PR, what got deployed, and exactly what the requester will find when they test.

## Presentation contract (standing)

Story first, conceptual, one thing at a time, business terms with an example; rank with the rubric and explain the rank; celebrate what worked; plainly separate verified from unverified; close with a summary someone who saw none of it can follow — outcome first, no shorthand. Never bury the headline. When the requester's observation was wrong in an informative way, say so directly with the evidence.
