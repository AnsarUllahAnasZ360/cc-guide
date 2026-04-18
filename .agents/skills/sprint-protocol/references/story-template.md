# Story Template

Use this template for every story. A story is a **complete feature or fix** — not a single file change, not one endpoint, not one component.

## Template

```markdown
# STORY-NNN: [Verb-first title]
**Complexity:** complex | simple

## Overview
[1-3 sentences. What changes? Why?]

## Problem
[Current broken/missing behavior. Be specific:]
- What page/route/component is affected?
- What does the user see today?
- What should the user see instead?

### Current State
[Research findings: files, schema, patterns, dependencies]
- `path/to/file.ts:line` — [What it does, what's wrong]
- `path/to/schema.ts:line` — [Relevant schema state]

### Why This Matters
[Explain the human impact in plain language. This is not a technical section —
it's about why someone should care about this change.]
- Who is affected and how often do they hit this problem?
- What's the cost of NOT fixing this? (frustration, lost time, workarounds, churn)
- What does success look like from the user's perspective?

Example: "Right now, every time a user creates a new client, they have to
manually re-enter the address because the form doesn't remember previous input.
This happens dozens of times a day for power users. Fixing this saves roughly
5 minutes per session and eliminates a top-3 support complaint."

## Solution Approach
[WHAT to change, not HOW. Reference patterns. Leave room for worker to improve.]

- Reference existing patterns: "Follow the pattern in `src/components/X.tsx`"
- Note constraints: "Must be backwards-compatible with existing data"
- Flag alternatives: "Option A vs B — recommended: A because..."

### Recommendations
[Explain the reasoning behind the chosen approach — not just what, but why.]
- **Chosen approach:** [Describe the recommended path and the reasoning behind it]
- **Alternatives considered:** [What else was evaluated and why it was rejected]
  - Option B: [Approach] — rejected because [concrete reason: complexity, performance, maintenance burden]
  - Option C: [Approach] — rejected because [concrete reason]
- **Key trade-offs:** [What are we accepting by going this route? What do we gain?]

> **Note to implementing agent:** Do NOT follow this approach blindly.
> Research the codebase yourself. Think critically. If you find a better
> approach, use it. Document your reasoning in progress.md.

## Research Items
- [ ] Read `path/to/file.ts` — understand current implementation
- [ ] Check `path/to/related.ts` — look for reusable patterns
- [ ] Investigate [specific area] — look for edge cases
- [ ] [Other specific files/areas the worker should investigate before implementing]

## Required Skills
[Which skills should the worker load before starting, and why each one helps.]
- `skill-name`: [How this skill helps with this specific story]
- Example: `react-best-practices`: Ensures component follows established React patterns
- Example: `sprint-protocol`: Needed for progress.md format and commit conventions

## Tasks
Each task should be self-contained — a worker reading only that task (without the
full story) should understand what to do, why, and what "done" looks like.

- [ ] Research codebase and refine implementation plan
      *Context:* Read all referenced files. Challenge the story's approach if you
      find something better. *Done when:* You have a concrete plan and have
      documented any deviations from the story in progress.md.
- [ ] [Task 1: Substantial deliverable — complete component, full API endpoint, etc.]
      *Context:* [Why this task exists, what it connects to, any gotchas.]
      *Done when:* [Specific mini acceptance criteria for this task alone.]
- [ ] [Task 2: Another substantial deliverable]
      *Context:* [Background so the worker doesn't need to re-read the whole story.]
      *Done when:* [What "complete" looks like for this task.]
- [ ] [Task 3: ...]
      *Context:* [...]
      *Done when:* [...]
- [ ] Write unit tests for [specific functionality]
      *Done when:* Tests cover happy path, error states, and edge cases identified
      in the story. All tests pass.
- [ ] Run typecheck and lint — fix all errors
- [ ] Run full test suite — fix any failures
- [ ] Code self-review: error handling, edge cases, type safety
- [ ] Update progress.md with insights

## Acceptance Criteria
Write each criterion so it explains both WHAT to verify and WHY it matters.
Split into functional (user-facing) and technical (code quality) criteria.

### Functional (user-facing behavior)
- [ ] [What the user should experience] — matters because [why this is important]
- [ ] [Error state behavior] — matters because [users will hit this when...]
- [ ] [Edge case behavior] — matters because [this scenario happens when...]
- [ ] [Use concrete values: "loads in <2s" not "loads fast"]

### Technical (code quality and reliability)
- [ ] All new code has unit tests — ensures regressions are caught early
- [ ] All tests pass
- [ ] typecheck passes with zero errors
- [ ] lint passes with zero errors
- [ ] [Performance, security, or accessibility criteria if relevant]

## Codebase References
- `path/to/file.ts:line` — [Why it matters]
- `path/to/pattern.ts` — [Pattern to follow]
- `path/to/test.ts` — [Test patterns to follow]

## Notes
- [Edge cases to watch for]
- [Things to explicitly NOT do]
- [Dependencies on other stories]
- [Known limitations or library quirks]
```

## Embedded Worker Workflow

Every story implicitly instructs the worker to follow this workflow:

```
1. READ your story and understand the objective
2. RESEARCH: Read the codebase files referenced in the story.
   Don't follow the story blindly — investigate on your own.
   Look for better patterns, existing utilities, edge cases the story missed.
3. THINK: Come up with your own implementation plan.
   Challenge the story's recommended approach if you find a better way.
4. PLAN: Create your task list (TaskCreate) with your refined approach.
5. IMPLEMENT: Work through tasks sequentially.
   - Run typecheck and lint after significant changes
   - Write code incrementally, verify as you go
6. TEST: Write unit tests for your code.
   Run typecheck and lint. Run all tests. Fix failures.
   Tests MUST pass.
7. REVIEW: Self-review your code.
   - Check error handling and edge cases
   - Check type safety
   - Check for security issues
   - Verify acceptance criteria are met
8. COMMIT: One commit for the story. Stage only relevant files.
9. UPDATE progress.md: Append your entry with insights.
```

## Sizing Checklist

Before finalizing a story, verify:

- [ ] **10-30 files** in scope (not fewer — pack more in; not more — split)
- [ ] **500-2000 lines** of changes (below 500 is too small, above 2000 split)
- [ ] **5-12 tasks** (below 5 is too vague, above 12 split)
- [ ] **20-30 min agent time** (below 20 is too much overhead, above 30 risks context limits)
- [ ] **Vertical slice** (touches all needed layers, not just one)
- [ ] **Tests included** (not a separate story — tests ship with the feature)
- [ ] **Related bugs packed** together (not separate stories)
- [ ] **Story justifies scope** (not too loose, not too tight)
- [ ] **Complexity tier assigned** (complex or simple)
- [ ] **NO browser verification tasks** (that's Phase 5)

## Task Granularity Guide

**Too granular (micro-tasks):**
- "Create the schema field" — this is a sub-step, not a task
- "Add the import statement" — obviously part of implementation
- "Create the file" — a file is not a deliverable
- "Update the type definition" — part of a larger task

**Right level (substantial deliverables):**
- "Add client schema with all fields, validators, and indexes"
- "Implement CRUD mutations with auth checks and error handling"
- "Build client list page with search, filters, and pagination"
- "Add client detail drawer with edit form and validation"
- "Wire up navigation, sidebar links, and route guards"

Each task should take the agent 10-30 minutes of focused work, not 2 minutes.

**The litmus test:** If a task takes less than 5 minutes, it's too granular. If it takes more than 45 minutes, it's too large.
