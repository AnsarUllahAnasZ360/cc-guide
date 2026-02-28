# Phase 4: Execution

Implement all stories using worker teammates.

**Command:** `/sprint-execute`
**Concurrency limit:** 2 workers running simultaneously (no total cap — spawn as many as needed across the sprint)
**Deliverables:** Code changes, progress.md, sprint-completion.md (committed to `sprint/<name>` branch)
**Prerequisites:** All stories reviewed, verification-checklist.md exists

## Team Lead Protocol

You are a **pure orchestrator**. You do NOT implement. You do NOT read source code. You only use team management tools and read sprint artifacts.

### Startup

1. **Read context:**
   - CLAUDE.md — project conventions
   - `sprints/<name>/README.md` — sprint overview, stories, scope
   - All story files in `sprints/<name>/stories/` — understand what needs to be done
   - `sprints/<name>/verification-checklist.md` — understand what will be verified

2. **Create team:**
   ```
   TeamCreate:
     team_name: "sprint-<name>-execution"
   ```

3. **Create task list:**
   Call `TaskCreate` for every story:
   - Subject: "[STORY-XXX] Title"
   - Description: "File: sprints/<name>/stories/STORY-XXX.md | Tier: complex/simple"

4. **Initialize progress.md:**
   Create `sprints/<name>/progress.md` with the header from `references/templates.md`.

### Per-Story Workflow

For each story in order:

```
1. Read the story file — check tier and dependencies
2. Verify dependencies are met (previous stories completed)
3. Read progress.md — gather insights from earlier workers relevant to this story
4. Mark task in_progress (TaskUpdate)
5. Spawn worker teammate (see Worker Spawn Template)
   - Include the full story context in the prompt parameter
   - Include relevant insights from progress.md (earlier workers' discoveries)
   - Later workers benefit from earlier workers' knowledge — pass it forward
6. Wait for worker to report completion or blocker
7. Read the latest progress.md entry — verify work was done
8. Verify the commit exists (read progress entry for hash)
9. Shut down the worker:
   SendMessage: type: "shutdown_request", recipient: "worker-story-XXX"
10. Mark task completed (TaskUpdate)
11. Launch next worker (keep the pipeline full — see Concurrency Rules)
```

**Context forwarding:** The lead is the bridge between workers. When spawning worker #4, include any insights from workers #1–#3 that are relevant to story #4. This is how the team learns across stories without workers needing to communicate directly.

### Concurrency Rules

**Concurrency limit: 2 workers running simultaneously.** There is NO total cap — spawn as many workers as needed across the sprint, but only 2 are active at any given time. As one worker finishes, launch the next pending story immediately.

You may run 2 workers concurrently for independent stories (no shared files, no dependencies). If stories share files or have a dependency, run them sequentially.

**Example:** For a sprint with 8 stories, you launch workers #1 and #2. When #1 finishes, launch #3 (now #2 and #3 are running). When #2 finishes, launch #4, and so on. The pipeline stays full — never wait with an empty slot when there is pending work.

### Completion

When all stories are done:

1. **Run build status check** — spawn a teammate to run typecheck, lint, tests
2. **Write sprint-completion.md** — use template from `references/templates.md`
3. **Commit sprint-completion.md:**
   ```bash
   git add sprints/<name>/sprint-completion.md
   git commit -m "Sprint <name>: Phase 4 — execution complete"
   ```
4. **Notify user:** "Sprint execution complete. [N] stories implemented. Ready for Phase 5 (Verification)."
5. **Shut down all teammates**
6. **TeamDelete**

---

## Worker Spawn Template

```
Task tool parameters:
  team_name: "sprint-<name>-execution"
  name: "worker-story-XXX"
  model: "opus" (complex) or "sonnet" (simple)
  subagent_type: "general-purpose"
  prompt: |
    You are a Worker Agent on Sprint <name>.

    STORY: [STORY-XXX] [Title]
    FILE: sprints/<name>/stories/STORY-XXX.md

    SKILLS: Load relevant skills as specified in your story file.
    GUIDE: Follow the complete workflow in references/worker-guide.md.

    READ THESE FILES IN ORDER (do not skim — read fully):
    1. CLAUDE.md — project context and conventions
    2. sprints/<name>/README.md — sprint overview
    3. sprints/<name>/stories/STORY-XXX.md — YOUR STORY (note any skills listed)
    4. sprints/<name>/progress.md — read ALL of it, understand what previous workers did and learned
    5. references/worker-guide.md — your complete workflow reference

    WORKFLOW — Follow this exactly:
    1. Read all context documents above
    2. SKILLS: Load any skills listed in your story file. Skills give you
       domain-specific guidance — use them throughout implementation.
    3. RESEARCH: Read the codebase files referenced in your story.
       Don't follow the story blindly — investigate on your own.
       Look for better patterns, existing utilities, edge cases the story missed.
    4. THINK: Come up with your own implementation plan.
       Challenge the story's approach if you find a better way.
    5. PLAN: You MUST create your task list (TaskCreate) before ANY implementation.
       No implementing without tasks. The task list is your contract.
       Your task list MUST include:
       - Write unit tests for your code
       - Run typecheck and lint — fix all errors
       - Run full test suite — fix any failures
       - Code self-review: error handling, edge cases, type safety
       - Update progress.md with insights
    6. IMPLEMENT: Work through tasks sequentially, marking complete as you go.
       Run typecheck and lint after significant changes.
    7. TEST: Write unit tests. Run all tests. Fix failures. Tests MUST pass.
    8. REVIEW: Self-review — error handling, edge cases, type safety, security.
    9. COMMIT: One commit for this story.
       Format: "[STORY-XXX] Title — brief summary"
       Stage only relevant files (not git add . or git add -A).
    10. UPDATE progress.md: Append your entry with insights for next worker.
        Include: status, commit hash, files, summary, implemented items, insights.

    RULES:
    - Do NOT modify files outside your story's scope
    - Do NOT spawn other agents
    - Do NOT skip TaskCreate — no tasks, no implementation
    - Do NOT skip tests or self-review
    - Do NOT do browser verification (that's Phase 5)
    - If blocked: report to Team Lead via SendMessage
    - If approach fails: communicate before deviating

    HANDLING UNRELATED FAILURES:
    - If you encounter test failures or errors unrelated to your work, fix them constructively
    - No `// @ts-ignore`, no `test.skip()`, no suppressing errors
    - If truly unfixable (not your domain, requires external changes), document in progress.md

    REPORT: "Complete. STORY-XXX committed. Progress entry added."
```

---

## Worker Task List Requirement

Workers MUST create task lists (via `TaskCreate`) before writing any implementation code. This is non-negotiable.

### Why Task Lists Are Critical

1. **Contract:** The task list is the contract — if it's not in the task list, it doesn't get done. The lead can verify exactly what the worker committed to.
2. **Compaction survival:** Task lists survive context compaction. When a worker's context gets compressed mid-implementation, the task list remains as the definitive record of what needs to happen. Without it, the worker loses track of remaining work.
3. **Progress tracking:** The lead monitors worker progress through task status. `TaskList` gives the lead a real-time view of how far along a worker is.
4. **Self-discipline:** Creating the task list forces the worker to think through the full scope before touching code. This catches missing steps (tests, lint, progress update) before they're forgotten.

### What the Task List Must Include

Every worker task list must contain at minimum:
- Implementation tasks derived from the story requirements
- Write unit tests
- Run typecheck and lint — fix all errors
- Run full test suite — fix any failures
- Self-review: error handling, edge cases, type safety
- Update progress.md with insights for next worker

### Lead Enforcement

If a worker starts implementing without creating tasks, the lead should intervene via `SendMessage` and direct the worker to create their task list first. An implementation without a task list is untracked work.

---

## progress.md as Memory File

progress.md is the team's shared memory across workers. It is the most important coordination artifact during execution.

### Rules
- **Append-only** — never edit or delete previous entries
- **No hard limit** — let it grow as needed
- **Workers MUST read ALL of it** before starting (not just last 3 entries)
- **Workers MUST append** an entry after completing their story
- **Include commit hash** so the lead can verify

### Why Workers Read All of It

Previous workers leave critical knowledge:
- "The schema was already partially migrated by STORY-001"
- "File X has a side effect — don't import it directly"
- "The codebase uses pattern Y for Z — follow it"
- "I found a bug in file W — left it for a later story"

This knowledge prevents repeated mistakes and helps workers build on each other's work.

### Entry Format

```markdown
---

## [STORY-XXX] Short title
**Status:** completed | blocked | partial
**Commit:** <hash>
**Files:** path/a.ts, path/b.tsx (max 5, "and N more" if >5)

**Summary:** 1-2 sentences on what was accomplished.

**Implemented:**
- Bullet 1 (max 8 words)
- Bullet 2
- Bullet 3 (max 5 bullets)

**Insights for next worker:**
- [Patterns discovered, gotchas, warnings, context]
```

---

## One Commit Per Story

Each story produces exactly one commit.

**Format:**
```
[STORY-XXX] Title — brief summary of what was done

- Key change 1
- Key change 2
- Key change 3
```

**Lead verification:** After each worker completes, the lead reads the progress entry to confirm a commit was made. The commit hash is in the entry.

**Staging rules:** Workers stage specific files with `git add path/to/file`, NOT `git add .` or `git add -A`. This prevents accidentally staging unrelated files.

---

## Compaction Recovery

When compaction happens during execution:

1. **TaskList** — this is your exact state (which stories are done, which are in progress)
2. **Read README.md** — sprint overview and story list
3. **Read progress.md** — last 3 entries for current state
4. **Continue** from where TaskList says you are

Do NOT restart. Do NOT re-read all stories. The task list tells you exactly where you are.

---

## Failure Escalation

### Worker reports a blocker
- **Resolvable:** Provide guidance via SendMessage, or spawn a fix worker
- **Not resolvable:** Document in progress.md, skip story, assess downstream impact

### Worker reports partial completion
- **Small remaining work:** Spawn new worker to finish
- **Large remaining work:** Log as incomplete, note in progress.md

### 3+ consecutive failures
If 3 or more consecutive stories report blockers in the same area:
1. **STOP execution** — do not grind through cascading failures
2. **Notify user:** What area fails, which stories affected, what pattern
3. **Wait for guidance**

---

## sprint-completion.md Format

Written by the lead after all stories complete:

```markdown
# Sprint: <name> — Completion Summary

**Sprint Goal:** [From README]
**Completed:** [Date]

## Results

| Story | Title | Status | Commit |
|-------|-------|--------|--------|
| STORY-001 | [Title] | completed | abc1234 |
| STORY-002 | [Title] | completed | def5678 |

## Build Status
- TypeScript: PASS / FAIL
- Lint: PASS / FAIL
- Tests: PASS / FAIL ([N] passed, [N] failed)
- Build: PASS / FAIL

## Outstanding Issues
- [Any unresolved problems, partial completions, known bugs]

## Notes
- [Anything the verification phase needs to know]
```

---

## Codex Platform Notes

When running on Codex multi-agent:
- Use worker/explorer agent types instead of teammate naming
- Sandbox policy requires explicit file access grants
- Parallel spawning is supported — adjust max workers as needed
- Workers cannot access browser — Phase 5 handles all verification
- Commit format is the same
- progress.md protocol is the same
