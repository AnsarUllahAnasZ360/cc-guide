---
name: sprint-execute
description: Use when the user asks Codex to execute a sprint, implement all sprint stories, run a multi-agent development sprint, or carry stories through code changes and commits.
---

# Sprint Execute

Run Phase 4 of Sprint Protocol.

1. Read `../sprint-protocol/SKILL.md`.
2. Read `../sprint-protocol/references/codex-orchestration.md`.
3. Read `../sprint-protocol/references/phase-4-execution.md`.
4. Read `../sprint-protocol/references/worker-guide.md`.
5. Use `update_plan`.
6. Ask the user for branch strategy unless already specified.
7. Ask how many stories to run at once: 1, 2, 3, or 4.
8. Treat the selected concurrency as a maximum and lower it when dependencies or conflict risk require.
9. Keep `progress.md` current.
10. Run quality closure, write `sprint-completion.md`, and create one sprint commit by default.

Treat legacy `/sprint-execute <name>` as this skill.
