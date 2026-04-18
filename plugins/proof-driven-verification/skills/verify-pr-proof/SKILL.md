---
name: verify-pr-proof
description: Single-invocation ProofOps orchestrator for verifying a PR, branch, or completed coding task end to end with definition-of-done gating, Code Review agents, Browser QA agents, Developer Fixer agents, optional framework diagnostics, Agent Browser evidence, iterative fixes, validated artifacts, optional Remotion plus Deepgram proof video, and final commit. Use when the user asks to verify, review, prove, QA, test, inspect a PR/branch/task, create evidence, produce proof of work, or run ProofOps.
---

# Verify PR Proof

This is the orchestrator skill. It should feel like one command to the user: run immediately, stay concise, do setup checks silently, and only interrupt for missing success criteria or real blockers.

## Load When Needed

- Read `../../references/tool-selection.md` before choosing browser, MCP, GitHub, or Computer Use tools.
- Read `../../references/stack-profiles.md` after initial repo discovery.
- Read `../../references/codex-review.md` before using Codex CLI or GitHub review outputs.
- Read `../../references/evidence-contract.md` before creating or validating artifacts.
- Read `../../references/review-rubric.md` before review sharding or reviewer synthesis.
- Read `../../references/agent-roles.md` before assigning specialist work.
- Use `../verification-setup/SKILL.md` if tools or environment are unknown.
- Use `../code-review-swarm/SKILL.md` for review-only subagent instructions.
- Use `../browser-dogfood/SKILL.md` for human-style browser QA.
- Use `../browser-proof-video/SKILL.md` for screenshots, WebM, narration, and final MP4.
- Use `../agent-browser/SKILL.md` for detailed Agent Browser commands.
- Use `../remotion-best-practices/SKILL.md` for custom proof-video work.
- Use `../computer-use-fallback/SKILL.md` when structured automation cannot cover the flow.

## Required Workflow

1. **Intake**
   - Read the user prompt, repo instructions, current branch, `git status --short --branch`, diff stat, changed files, and available scripts.
   - If a PR is referenced, resolve PR metadata and patch context with GitHub plugin or `gh` capabilities where available.
   - Build a task list with: expected behavior, affected surfaces, non-goals, browser routes/flows, checks, and evidence plan.

2. **Definition-of-done gate**
   - Infer a concrete definition of done from the prompt and diff.
   - If success criteria are ambiguous, missing, or not testable, stop and ask focused questions before review or implementation.
   - Do not proceed to fixes with a vague goal like “make sure it works.”

3. **Quiet preflight**
   - Run `node plugins/proof-driven-verification/scripts/doctor.mjs --json` internally.
   - Do not print the full doctor output. Report only failures that block verification.
   - Detect the stack and app start command from local files, scripts, README, CI, and framework config.
   - If local services block the server, use documented cloud/dev alternatives only when the repo provides them; otherwise stop with evidence.

4. **Team launch**
   - Launch Code Review agents first when subagents are authorized; otherwise run the same role serially.
   - Use `codex review --uncommitted` or `codex review --base <branch>` as one advisory review source when available.
   - Launch Browser QA agents after code review, using Agent Browser and bundled dogfood guidance.
   - If Next.js MCP reports runtime errors, launch a Next.js Diagnostics specialist or run that role serially.

5. **Synthesis and remediation**
   - Merge Code Review and Browser QA reports.
   - If reports pass, proceed to proof production.
   - If reports fail, create a remediation plan and assign Developer Fixer agents or implement serially.
   - Re-run Browser QA after fixes. Continue until Browser QA returns `pass` or a hard blocker is proven.

6. **Browser proof requirements**
   - For Next.js apps, use Next.js DevTools MCP first when available: `get_errors`, `get_routes`, `get_page_metadata`, `get_logs`.
   - Use Agent Browser for durable proof: screenshots, snapshots, console logs, page errors, network requests, and WebM.
   - Save all evidence under `artifacts/verification/<timestamp>/`.

7. **Completion**
   - Create `verification-report.md` and `manifest.json`.
   - Run `node plugins/proof-driven-verification/scripts/validate-artifacts.mjs <artifact-dir>`.
   - Render `proof-video.mp4` only after pass or for a blocker report:
     `node plugins/proof-driven-verification/scripts/render-proof-video.mjs <artifact-dir>`.
   - Commit verified code changes after pass. Do not commit bulky generated media unless explicitly requested.

## User-Facing Style

- Keep the final answer concise.
- Summarize by role: Code Review, Browser QA, Fixes, Proof Artifacts, Status.
- Keep detailed logs in `verification-report.md`.
- Never ask the user to run setup/doctor manually during a normal ProofOps run.

## Final Response

Include:

- final verdict: `pass`, `partial`, or `blocked`
- commit hash if committed
- commands/tests run
- routes/flows verified
- evidence links
- residual risks
- hard blockers, if any

Never say a video, screenshot, report, or log exists unless the validator confirms it.
