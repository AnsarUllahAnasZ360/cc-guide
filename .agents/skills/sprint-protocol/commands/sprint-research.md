---
description: Compatibility alias for Sprint Protocol Phase 1 in Codex.
---

# sprint-research

Use the Codex skill `sprint-research`, or load `.agents/skills/sprint-protocol/references/phase-1-research.md`.

Do not use Claude `TeamCreate`, `TaskCreate`, or `SendMessage` tools. In Codex, use `update_plan`, `spawn_agent`, `wait_agent`, durable sprint artifacts, and `sprints/<name>/state.md`.
