# audit-run — team usage

The `audit-run` skill drives the full audit of a Millwork OS agent run: evidence collection, cost/time accounting, behavior forensics, two-persona judgment, and a documented fix plan. It lives in the repo at `.claude/skills/audit-run/SKILL.md`, so Claude Code picks it up automatically in any checkout.

## Prerequisites

- **Repo checkout** with `pnpm install` done (the skill drives `pnpm audit:run`, which is `packages/agents/scripts/audit-run.ts` — already in the repo).
- **Env files**: root `.env.local` per the team onboarding. It already carries the DEV Langfuse keys (`Millwork - dev` project on the self-hosted host) — that is all you need for local/dev-run audits. Model API keys also go in root `.env.local`, not the agent server's own `.env`.
- **Local stack** for local-run audits: `pnpm dev:all` (Docker + Supabase + web + langgraph dev server). Do not audit against a stack someone else is actively driving.
- **Prod access (optional tier)**: auditing a PRODUCTION run requires Railway access to the `langgraph-server` service. Every prod command runs under `railway run --service langgraph-server -- …`, which injects the prod DB URL and prod Langfuse keys for that one process — you never see or handle the key values. If you don't have Railway access, audit your local/dev runs, or ask the founder to grant access or run the prod probe for you. Never ask anyone to paste prod keys into chat, an env file, or a script.
- **Answer keys** (optional, for graded audits): grader-only, provided out-of-band by the founder. They must never enter the repo, the audit packet quotes, code, or prompts (prime directive D1). Grading is scope + takeoff only, never dollars.

## How to invoke

In Claude Code, from the repo root:

```
/audit-run <chat URL or thread id> — plus your own observations, verbatim
```

or just say "audit this run" and paste the millos.ai chat URL with everything you noticed (slow, wrong scope, expensive, odd behavior). Your observations are treated as questions to answer with evidence — it's fine (and useful) if some turn out to be wrong.

## What you get

- An **audit packet** at `docs/audits/<slug>/`:
  - `technical.md` — the raw `pnpm audit:run` resolution output,
  - `audit.md` — the story, accounting, rubric grade, both persona judgments,
  - `problems/NN-slug.md` — one file per confirmed problem, written so a fresh agent could implement the fix,
  - `fix-plan.md` — epics → tickets plus the execution lanes and order.
- `docs/` is **gitignored and stays that way** — the packet never gets committed; share it by other means if needed.

## What NOT to do

- **Audits never implement fixes.** The audit phases are strictly read-only against every source (DB, Langfuse, VFS, logs). Nothing is built before the fix plan is presented and explicitly approved.
- Never start/stop dev processes you did not start yourself.
- Never commit `docs/` or `sprints/` content (`verify:repo-hygiene` blocks it), and never copy secrets, prod keys, or answer-key values into any file.
- Production deployment (execution level 3) is founder-gated — a teammate's own audit never triggers a deploy.
- No AI-attribution markers anywhere: commits, PRs, comments, reports (standing team rule).

## Execution (after the audit)

If your fix plan is approved, the skill's Phase 6 covers execution: agent bundles on one branch (`fix/<slug>`), one PR, verifier agents, and the full build gate (`pnpm lint && pnpm typecheck`, `pnpm test:all`, agents-package build). A fix that adds a new subsystem or a new refusal path needs founder sign-off regardless of who ran the audit (D9/D10).
