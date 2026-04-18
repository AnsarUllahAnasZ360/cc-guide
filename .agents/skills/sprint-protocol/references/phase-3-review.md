# Phase 3: Review & Audit

Review all stories with the user, audit for compliance, and produce the verification checklist.

**Command:** `/sprint-review`
**Team config:** Team for auditing + teammates for any changes
**Deliverables:** Updated stories, verification-checklist.md (committed to `sprint/<name>` branch)
**Prerequisites:** stories/ and README.md exist in `sprints/<name>/`

## Phase 3 Workflow

### 1. Present Sprint Summary

Show the user:
- Sprint goal
- Story count and tier breakdown (N complex, M simple)
- Brief description of each story
- Dependencies between stories

### 2. Walk Through Each Story

For each story, present to the user:
- Title and overview
- Problem being solved
- Solution approach
- Number of tasks and estimated scope
- Acceptance criteria highlights
- Complexity tier (S/M/L) and whether it seems justified

For each story, explicitly review weight and complexity:
- Is the complexity tier (S/M/L) justified for what the story actually asks?
- Should it be upgraded (underestimated complexity) or downgraded (overestimated)?
- Is the proposed solution approach sound and well-scoped?
- Can any changes improve the story before execution begins?

Ask: "Does this story look right? Any changes needed?"

### 3. Capture Feedback

**User feedback integration is the MAIN OBJECTIVE of Phase 3.** This is not just compliance checking — it is about incorporating the user's vision into the sprint. The review exists so the user can shape the sprint before execution locks it in.

Every piece of user feedback must be:
- **Addressed** — change made to the story immediately, OR
- **Acknowledged** — understood and will be addressed during execution, OR
- **Explicitly deferred with reasoning** — why it can't or shouldn't be done now

No feedback item should be silently ignored or lost. If the user raised it, it matters.

Classify each piece of user feedback:

| Type | Definition | Action |
|------|-----------|--------|
| Bug | Something wrong in the story | Spawn teammate to fix |
| Revision | Story works but needs changes | Spawn teammate to revise |
| Enhancement | New requirement to add | Spawn teammate to update story |
| Out of Scope | Request that doesn't belong in this sprint | Document for future sprint |

After all feedback is captured, summarize back to the user what was addressed, acknowledged, and deferred — so nothing falls through the cracks.

### 4. Create Review Team (if changes needed)

If any feedback requires story changes:

```
TeamCreate:
  team_name: "sprint-<name>-review"
```

**Spawn a teammate for each batch of changes.** The lead does NOT edit story files directly.

Use the Change Teammate Spawn Template below.

### 5. Compliance Audit

Run the full compliance check across ALL stories:

#### Story Quality Checks
- [ ] Every story has Problem section with file paths and line numbers
- [ ] Every story has Solution Approach with "Note to implementing agent" callout
- [ ] Every story has Research Items section
- [ ] Every story has 5-12 substantial tasks
- [ ] Every story has acceptance criteria with binary pass/fail
- [ ] Every story has Codebase References with exact paths

#### Mandatory Task Checks
- [ ] Every story includes "Write unit tests" task
- [ ] Every story includes "Run typecheck and lint" task
- [ ] Every story includes "Run full test suite" task
- [ ] Every story includes "Code self-review" task
- [ ] Every story includes "Update progress.md" task

#### Sizing Checks
- [ ] Every story: 10-30 files, 500-2000 lines, 5-12 tasks
- [ ] No horizontal slicing — all vertical
- [ ] Related bugs packed together
- [ ] Tests included in feature stories
- [ ] Story count justified (not too many loose stories)

#### Forbidden Elements
- [ ] No browser verification tasks in any story
- [ ] No "subagent" or "background agent" references
- [ ] No references to `.scratchpad/`

If any story fails audit, spawn a teammate to fix it.

### 6. Story Weight Review

Perform a dedicated review of story weight and sizing for every story in the sprint:

#### Complexity Tier Justification
- For each story, confirm the complexity tier (S/M/L) matches the actual work required
- S (Small): Straightforward changes, limited scope, low risk — sonnet-capable
- M (Medium): Multi-file changes, moderate logic, some uncertainty — sonnet with careful prompting
- L (Large): Cross-cutting changes, complex logic, high uncertainty — opus recommended
- Flag any story where the tier feels wrong (e.g., a story marked S that touches 8+ files)

#### Model Routing Validation
- Does the assigned model (opus vs sonnet) match the actual difficulty?
- Stories with complex architectural decisions, subtle bugs, or cross-system reasoning should use opus
- Stories with mechanical/repetitive changes, straightforward additions, or well-defined tasks can use sonnet
- Flag mismatches for user attention: "STORY-003 is marked sonnet but involves complex state management — consider opus"

#### Estimate Realism Check
- Are estimated files (10-30) realistic for the scope described?
- Are estimated lines (500-2000) realistic — not under-estimated (will cause shortcuts) or over-estimated (inflated scope)?
- Are estimated tasks (5-12) realistic — does each task represent real work, not padding?
- Compare estimates against the actual solution approach: do the numbers add up?

Flag all mismatches and present them to the user before proceeding.

### 7. Verify Story Packing

Check that stories are properly packed and the sprint is well-organized:

#### Merge Opportunities
- Are there thin stories (fewer than 5 tasks) that should be merged into a related story?
- Are there two stories touching the same files/modules that would be better combined?
- Would merging reduce cross-story dependencies without creating an oversized story?

#### Split Opportunities
- Are any stories overloaded (more than 12 tasks) that should be split?
- Does any single story try to solve two distinct problems that would be cleaner as separate stories?
- Are there stories where the risk profile varies — part is straightforward, part is risky — that should be separated?

#### Overall Packing Quality
- Is the total story count justified for the sprint scope?
- Is complexity distribution balanced (not all L stories, not all S stories)?
- Are dependencies between stories minimized?
- Can any changes improve the sprint structure before execution?

If packing issues are found, spawn teammates to restructure stories as needed.

### 8. Write verification-checklist.md

Produce `sprints/<name>/verification-checklist.md` using the template from `references/templates.md`.

For each story, derive verification checks from:
- Acceptance criteria → specific test commands and expected results
- UI-facing changes → pages/routes to verify with expected behavior
- Cross-story interactions → integration checks

The verification checklist is used by Phase 5 to validate all work.

### 9. Commit Updated Artifacts

```bash
git add sprints/<name>/stories/ sprints/<name>/verification-checklist.md
git commit -m "Sprint <name>: Phase 3 — review and verification checklist"
```

### 10. Shut Down Team (if created)

```
SendMessage: type: "shutdown_request" to each teammate
TeamDelete
```

### 11. Get Final Approval

Present to user:
- Updated story summary (any changes from review)
- Compliance audit results (all passing)
- Verification checklist summary
- Ask: "Sprint is ready for execution. Approve to proceed to Phase 4?"

**Do NOT proceed to Phase 4 without explicit user approval.**

---

## Change Teammate Spawn Template

```
Task tool parameters:
  team_name: "sprint-<name>-review"
  name: "reviewer-N"
  model: "sonnet"
  subagent_type: "general-purpose"
  prompt: |
    You are a review teammate for Sprint <name>.

    TASK: Update story files based on review feedback.

    READ FIRST:
    1. CLAUDE.md — project context
    2. sprints/<name>/README.md — sprint overview
    3. The story template at: skills/sprint-protocol/references/story-template.md

    CHANGES TO MAKE:
    [List specific changes per story file]

    - For STORY-NNN (sprints/<name>/stories/STORY-NNN.md):
      [Specific changes: add task, update criteria, fix problem section, etc.]

    RULES:
    - Follow the story template exactly
    - Maintain all mandatory tasks (unit tests, typecheck, lint, test suite, self-review, progress.md)
    - Do NOT add browser verification tasks
    - Keep sizing within limits (10-30 files, 500-2000 lines, 5-12 tasks)
    - Report what you changed and why
```

---

## Feedback Classification Guide

### Bug in Story
User says: "The file path in STORY-003 is wrong" or "This story references a component that was removed"
- Action: Spawn teammate to fix the specific issue
- Priority: Must fix before execution

### Revision
User says: "I want STORY-005 to also handle the mobile case" or "Change the approach in STORY-002"
- Action: Spawn teammate to revise the story
- Priority: Should fix before execution

### Enhancement
User says: "Can we also add dark mode support?"
- Action: Evaluate — add to existing story if it fits, create new story if needed
- Priority: Discuss scope impact with user

### Out of Scope
User says: "What about redesigning the whole navigation?"
- Action: Document for future sprint. Do NOT add to current sprint.
- Priority: None for this sprint

---

## Compaction Recovery

If compaction happens during Phase 3:
1. `TaskList` — see which stories have been reviewed
2. Read `sprints/<name>/README.md` for the story list
3. Check if `sprints/<name>/verification-checklist.md` exists
4. Continue from where your task list says you are
