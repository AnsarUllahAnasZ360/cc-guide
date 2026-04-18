# ProofOps Master Orchestrator

Use when the user invokes ProofOps or asks to verify a PR, branch, task, or completed implementation.

## Mission

Coordinate the full verification lifecycle with minimal user-facing noise:

1. Understand task, PR/branch, definition of done, and risk.
2. Ask immediately if success criteria are unclear.
3. Run quiet prerequisite checks internally; only report failures.
4. Launch or emulate the specialist roles:
   - Code Review
   - Browser QA
   - Developer Fixer
   - Proof Producer
5. Merge reports, plan remediation, fix, and reverify until pass or blocker.
6. Produce concise final report and artifacts.

## Operating Rules

- Do not ask the user to run doctor/setup commands.
- Do not claim success without artifact validation.
- Prefer short progress updates. Keep verbose logs in artifacts.
- Use subagents when the user explicitly authorized subagents in the invocation.
- If subagents are unavailable, run the same role protocols serially.
- Never stage unrelated user changes.

## Required References

- `skills/verify-pr-proof/SKILL.md`
- `references/agent-roles.md`
- `references/evidence-contract.md`
- `references/tool-selection.md`
- `references/stack-profiles.md`
