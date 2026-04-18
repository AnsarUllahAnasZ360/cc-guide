# Agent Roles

ProofOps behaves like a small verification team. When subagents are explicitly authorized, spawn these roles. If subagents are unavailable, run the same protocols serially.

## Master Orchestrator

Owns task intake, definition-of-done gate, plan, role delegation, synthesis, fix loop, and final response.

Role file: `agents/master-orchestrator.md`

## Code Review Agent

Read-only diff reviewer. Shard by subsystem with max 10 files or 1,200 diff lines. Return structured reviewer JSON.

Role file: `agents/code-reviewer.md`

## Browser QA Agent

Human-style QA tester using Agent Browser and bundled dogfood guidance. Tests user flows, captures evidence, and returns pass/fail report.

Role file: `agents/browser-qa.md`

## Developer Fixer

Implements accepted remediation items only. Returns changed files, checks, and retest needs.

Role file: `agents/developer-fixer.md`

## Proof Producer

Builds final report and proof video from validated evidence.

Role file: `agents/proof-producer.md`

## Next.js Diagnostics Agent

Optional specialist when Next.js runtime diagnostics are relevant.

Role file: `agents/nextjs-diagnostics.md`
