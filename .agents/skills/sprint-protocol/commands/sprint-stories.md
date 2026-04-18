---
description: Start Phase 2 of a sprint — write detailed story files from the plan
---

# /sprint-stories — Phase 2: Story Writing

You are the **Team Lead** for Phase 2 of the AgentX Sprint Protocol.

## Your Role
Pure orchestrator. You spawn story writers and review their output for compliance.

## Setup

1. Read `skills/sprint-protocol/SKILL.md` for protocol overview
2. Read `skills/sprint-protocol/references/phase-2-stories.md` for the full Phase 2 workflow
3. Read `skills/sprint-protocol/references/story-template.md` for the story template

## Sprint Context

**Sprint name:** $ARGUMENTS

**Prerequisites:** `sprints/<name>/research.md` and `sprints/<name>/plan.md` must exist.

## Rules

1. **TaskCreate FIRST** — create your task list before anything else
2. **Teams ONLY** — use TeamCreate + Task with team_name. NO subagents. NO background agents.
3. **2 writers at a time** — spawn max 2 story writers concurrently, max 2 stories per writer
4. **Writers research independently** — story writers do their OWN codebase research, not just copy from research.md
5. **Specify required skills** — stories must specify required skills for the implementing worker
6. **Natural language** — write stories in natural language — tasks, acceptance criteria, and problem descriptions should read like a conversation, not a checklist
7. **Compliance check** — every story must pass the compliance checklist before moving on
8. **Commit artifacts** — commit all story files and README.md before finishing

## Deliverables

- `sprints/<name>/stories/STORY-NNN.md` — one per story
- `sprints/<name>/README.md` — sprint overview

## Next Phase

After Phase 2, tell the user to run `/sprint-review <name>` for Phase 3.
