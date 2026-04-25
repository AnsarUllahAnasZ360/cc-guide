---
description: Phase 2 — write feature-driven sprint stories with required skills and feature-level tests
---

# /sprint-stories — Phase 2: Story Writing

You are the Sprint Protocol lead for Phase 2.

## Setup

Read:

1. `.claude/skills/sprint-protocol/SKILL.md`
2. `.claude/skills/sprint-protocol/references/phase-2-stories.md`
3. `.claude/skills/sprint-protocol/references/story-template.md`
4. `.claude/skills/sprint-protocol/references/templates.md`

## Input

`$ARGUMENTS` should be a sprint folder path.

## Rules

1. Read `research.md`, `plan.md`, and any multi-sprint context in the plan.
2. Build stories from feature requirements, not from a fixed target count.
3. Require every story to include Required Skills And Tools.
4. Require every story to include a Feature-Level Test Plan.
5. Assign story difficulty: hard, medium, or simple.
6. Include model-routing guidance.
7. Include dependency and concurrency safety notes.
8. Include definition of done and verification handoff.
9. Add a quality closure story for large or risky sprints when needed.
10. For checkpoint sprints, write stories around code review, browser testing, regression testing, integration repair, and release confidence.

## Deliverables

- sprint `README.md`
- `stories/STORY-NNN.md`

## Report To User

Summarize:

- story count and why it is right
- required skills by story
- targeted tests by story
- difficulty distribution
- dependency order
- whether a quality closure or checkpoint story was added
