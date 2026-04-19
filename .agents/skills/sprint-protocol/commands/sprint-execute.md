---
description: Compatibility alias for Sprint Protocol Phase 4 in Codex.
---

# sprint-execute

Use the Codex skill `sprint-execute`, or load `.agents/skills/sprint-protocol/references/phase-4-execution.md` and `.agents/skills/sprint-protocol/references/worker-guide.md`.

Do not use Claude `TeamCreate`, `TaskCreate`, or `SendMessage` tools. In Codex, use `update_plan`, at most two active `worker` agents for independent stories, durable `progress.md`, and explicit agent cleanup.
