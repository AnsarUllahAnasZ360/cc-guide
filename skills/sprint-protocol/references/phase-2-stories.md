# Phase 2: Story Writing

Write detailed story files from the sprint plan.

**Command:** `/sprint-stories`
**Team config:** 2 story writers at a time, max 2 stories per writer
**Deliverables:** stories/, README.md (committed to `sprint/<name>` branch)
**Prerequisites:** research.md and plan.md exist in `sprints/<name>/`

## Phase 2 Workflow

### 1. Verify Prerequisites

Read and verify these files exist:
- `sprints/<name>/research.md` — Phase 1 research output
- `sprints/<name>/plan.md` — Phase 1 plan output

If they don't exist, Phase 1 was not completed. Stop and inform the user.

### 2. Read Context

Read both files fully. Understand:
- The sprint goal and scope
- Each proposed story's title, brief, tier, and research items
- Dependencies between stories
- The research findings for each area

### 3. Create Task List

Call `TaskCreate` for every story from plan.md:
- Subject: "Write STORY-NNN: [title]"
- Description: "Tier: [tier], Research items: [items]"

### 4. Create Story Writing Team

```
TeamCreate:
  team_name: "sprint-<name>-stories"
```

### 5. Spawn Story Writers (Phased Batching)

**Spawn 2 story writers at a time.** Each writer handles up to 2 stories.

Phased batching example for 10 stories:
- **Batch A:** Writer 1 (STORY-001, STORY-002), Writer 2 (STORY-003, STORY-004)
- **Batch B:** Writer 1 (STORY-005, STORY-006), Writer 2 (STORY-007, STORY-008)
- **Batch C:** Writer 1 (STORY-009, STORY-010)

Wait for each batch to complete before starting the next.

Use the Story Writer Spawn Template below for each writer.

### 6. Review Returned Stories

For each story file returned, verify:
- Follows the template from `references/story-template.md`
- Passes the Story Compliance Checklist (below)
- Sizing is within limits
- Research items were actually investigated (not just copied from plan.md)

If a story fails compliance, either:
- Fix it yourself (if minor — missing section, wrong format)
- Spawn a new writer to revise it (if major — wrong scope, bad sizing)

### 7. Write README.md

Write the sprint README.md using the template from `references/templates.md`:
- Sprint goal and scope from plan.md
- Stories table with all stories, tiers, and statuses
- Dependencies from plan.md

### 8. Commit All Artifacts

```bash
git add sprints/<name>/stories/ sprints/<name>/README.md
git commit -m "Sprint <name>: Phase 2 — stories and README"
```

### 9. Shut Down Team

```
SendMessage: type: "shutdown_request" to each writer
TeamDelete
```

### 10. Report to User

Present:
- Total stories written
- Brief summary of each story
- Any compliance issues found and resolved
- Ask: "Ready to proceed to Phase 3 (Review & Audit)?"

---

## Story Writer Spawn Template

```
Task tool parameters:
  team_name: "sprint-<name>-stories"
  name: "story-writer-N"
  model: "sonnet"
  subagent_type: "general-purpose"
  prompt: |
    You are a story writer for Sprint <name>.

    TASK: Write detailed story files for assigned stories.

    READ FIRST:
    1. CLAUDE.md — project context
    2. sprints/<name>/research.md — research findings
    3. sprints/<name>/plan.md — sprint plan with proposed stories
    4. Read the story template at: skills/sprint-protocol/references/story-template.md

    YOUR ASSIGNED STORIES:
    - STORY-NNN: [Title] — [Brief from plan.md]
    - STORY-NNN: [Title] — [Brief from plan.md]

    CRITICAL INSTRUCTION — DO YOUR OWN RESEARCH:
    The plan.md gives you a starting point, but do NOT just copy from
    research.md. For each story:
    1. Read the files listed in the plan's "Research Items" column
    2. Explore BEYOND those files — look at related code, tests, patterns
    3. Find better approaches than what the plan suggests
    4. Discover edge cases the plan missed
    5. Understand the full scope before writing

    FOR EACH STORY, WRITE:
    sprints/<name>/stories/STORY-NNN.md

    Follow the template exactly. Key requirements:
    - Problem section with specific file paths and line numbers
    - Solution approach that gives direction without prescribing HOW
    - "Note to implementing agent" callout about not following blindly
    - Research Items section with specific files to investigate
    - 5-12 substantial tasks (not micro-steps)
    - MUST include: write unit tests, run typecheck/lint, run test suite,
      code self-review, update progress.md
    - NO browser verification tasks (that's Phase 5)
    - Acceptance criteria with binary pass/fail conditions
    - MUST include: all tests pass, typecheck passes, lint passes
    - Codebase references with exact file:line paths

    SIZING RULES:
    - 10-30 files per story
    - 500-2000 lines per story
    - 5-12 tasks per story
    - 20-30 min agent time per story
    - Vertical slices only

    REPORT: When done, list the stories you wrote and any concerns
    about sizing.
```

---

## Story Compliance Checklist

Every story MUST pass these checks:

### Structure
- [ ] Has Overview section (1-3 sentences)
- [ ] Has Problem section with file paths and line numbers
- [ ] Has Current State subsection with research findings
- [ ] Has Solution Approach with "Note to implementing agent" callout
- [ ] Has Research Items section with specific files to investigate
- [ ] Has Tasks section with 5-12 substantial tasks
- [ ] Has Acceptance Criteria with binary pass/fail conditions
- [ ] Has Codebase References with exact file:line paths
- [ ] Has Complexity tier assigned (complex or simple)

### Mandatory Tasks
- [ ] Has "Write unit tests for [specific functionality]" task
- [ ] Has "Run typecheck and lint — fix all errors" task
- [ ] Has "Run full test suite — fix any failures" task
- [ ] Has "Code self-review: error handling, edge cases, type safety" task
- [ ] Has "Update progress.md with insights" task
- [ ] Has "Research codebase and refine implementation plan" as first task

### Forbidden Elements
- [ ] NO browser verification tasks
- [ ] NO "verify in browser" steps
- [ ] NO horizontal slicing (must be vertical)

### Sizing
- [ ] 10-30 files in scope
- [ ] 500-2000 lines estimated
- [ ] 5-12 tasks
- [ ] 20-30 min estimated agent time
- [ ] Vertical slice (touches all needed layers)
- [ ] Related bugs packed together (not separate stories)
- [ ] Tests included (not a separate story)
- [ ] Story justifies its scope

---

## Sizing Guide

### When to Pack More In

Pack more into a story when:
- Two proposed stories share most of their files
- A story has fewer than 5 tasks or under 500 lines
- You can describe two stories in one sentence
- A "test story" exists separately from its feature
- Individual bug stories exist for bugs in the same area

### When to Split

Split a story when:
- Combined scope exceeds 30 files
- Combined lines exceed 2000
- Domains are completely unrelated
- Implementation has hard sequential deployment dependencies

### Examples

**Good packing:**
- "Add client CRM: schema, list page, detail page, edit form, navigation" — ONE story (~25 files, ~1500 lines)
- "Fix navigation bugs: back button, breadcrumbs, sidebar highlighting, mobile menu, deep links" — ONE story (~15 files, ~800 lines)

**Bad packing (too granular):**
- "Add client schema" + "Add client list page" + "Add client detail page" + "Add client edit form" — Should be ONE story
- "Fix back button" + "Fix breadcrumbs" + "Fix sidebar" — Should be ONE story

**Correct split:**
- "Add billing system" + "Add whiteboard editor" — Completely unrelated domains, correct to split
- "Add search: full-text indexing + API" + "Add search: UI + filters" — Over 40 files combined, correct to split

---

## Compaction Recovery

If compaction happens during Phase 2:
1. `TaskList` — see which stories are written
2. Read `sprints/<name>/plan.md` for the full list
3. Check which story files exist in `sprints/<name>/stories/`
4. Continue from where your task list says you are
