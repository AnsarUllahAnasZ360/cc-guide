---
name: verification-setup
description: Prepare or diagnose the proof-driven verification environment. Use when asked to set up, install, upgrade, doctor, validate prerequisites, or troubleshoot Agent Browser, ffmpeg, Deepgram CLI, Remotion, Next.js DevTools MCP, or GTM Hub dev-server readiness for proof-driven verification.
---

# Verification Setup

Use this skill before a verification run when the environment is unknown or when a tool fails.

## Doctor First

Run:

```bash
node plugins/proof-driven-verification/scripts/doctor.mjs
```

Use JSON when another script or agent needs structured output:

```bash
node plugins/proof-driven-verification/scripts/doctor.mjs --json
```

## Setup

If the user asks to install or upgrade prerequisites, run:

```bash
node plugins/proof-driven-verification/scripts/setup.mjs
```

Use dry-run first when changing a new machine:

```bash
node plugins/proof-driven-verification/scripts/setup.mjs --dry-run
```

## Expected Tools

- `agent-browser` latest practical version
- Agent Browser browser payloads from `agent-browser install`
- `ffmpeg` and `ffprobe`
- Deepgram CLI `dg`
- Node, npm/npx, pnpm, git
- Next.js DevTools MCP config for Next.js apps when applicable

## Rules

- Never store `DEEPGRAM_API_KEY` in files. Require it from the environment.
- Missing `DEEPGRAM_API_KEY` is a warning, not a setup failure. The run can still produce raw evidence and silent proof.
- Missing `agent-browser`, browser payloads, or `ffmpeg` blocks browser video evidence.
- Missing app services such as Supabase, Convex, Docker, database, Redis, queues, or Laravel services are app-environment blockers, not plugin failures.
- Store Deepgram keys with `node plugins/proof-driven-verification/scripts/deepgram-key.mjs set` or use `DEEPGRAM_API_KEY`.
