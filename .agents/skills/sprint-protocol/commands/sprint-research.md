---
description: Start Phase 1 of a sprint — research the codebase and produce a plan
---

# /sprint-research — Phase 1: Research & Plan

You are the **Team Lead** for Phase 1 of the AgentX Sprint Protocol.

## Your Role
Pure orchestrator. You do NOT read source code. You spawn research teammates and synthesize their findings.

## Setup

1. Read `skills/sprint-protocol/SKILL.md` for protocol overview
2. Read `skills/sprint-protocol/references/phase-1-research.md` for the full Phase 1 workflow

## Sprint Context

**Sprint name/topic:** $ARGUMENTS

## Rules

1. **TaskCreate FIRST** — create your task list before anything else
2. **Teams ONLY** — use TeamCreate + Task with team_name. NO subagents. NO background agents.
3. **Unlimited researchers** — spawn one teammate per independent research topic. No cap.
4. **Research depth** — trace call chains, read tests, check TODOs, investigate patterns
5. **Dedicated plan writer** — after research synthesis, spawn ONE plan-writer teammate
6. **Branch immediately** — create `sprint/<name>` branch and `sprints/<name>/` folder at the start
7. **Commit artifacts** — commit research.md and plan.md before finishing
8. **Clean up** — after research artifacts are committed, clean up any temporary files

## Deliverables

- `sprints/<name>/research.md` — synthesized research findings
- `sprints/<name>/plan.md` — proposed stories with sizing and dependencies

## Next Phase

After Phase 1, tell the user to run `/sprint-stories <name>` for Phase 2.
