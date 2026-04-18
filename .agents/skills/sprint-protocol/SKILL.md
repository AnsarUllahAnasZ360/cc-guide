---
name: sprint-protocol
description: AgentX Sprint Protocol (ASP) — 5-phase lifecycle for multi-agent sprint execution. Use when the user says "plan a sprint", "research for a sprint", "write stories", "review the sprint", "execute the sprint", "verify the sprint", or any sprint-related request. Covers five phases: Research & Plan, Story Writing, Review & Audit, Execution, and Verification.
---

# AgentX Sprint Protocol

5-phase lifecycle for multi-agent sprint execution. Plan, write, review, execute, and verify — all through Codex teams.

## Three Invariants

1. **TaskCreate before anything else.** Every agent — lead and worker — creates a task list before doing any work. The task list is your memory. It survives compaction. Without it, you drift.
2. **Delegate everything via teams.** The lead researches nothing, implements nothing, verifies nothing. Every action goes through a teammate spawned via `Task` with `team_name`. NO subagents. NO background agents. Only full teammates.
3. **Fewer, bigger, well-packed stories.** A sprint has 4-8 stories (typical) or up to 12-15 (large feature). If you have 20+ stories, you have broken things down too far. Justify your story count.

## 5-Phase Lifecycle

| Phase | Name | Command | Input | Output | Reference |
|-------|------|---------|-------|--------|-----------|
| 1 | Research & Plan | `/sprint-research` | User brain dump | research.md, plan.md | `references/phase-1-research.md` |
| 2 | Story Writing | `/sprint-stories` | research.md, plan.md | stories/, README.md | `references/phase-2-stories.md` |
| 3 | Review & Audit | `/sprint-review` | stories/, README.md | Updated stories, verification-checklist.md | `references/phase-3-review.md` |
| 4 | Execution | `/sprint-execute` | stories/, README.md | Code, progress.md, sprint-completion.md | `references/phase-4-execution.md` |
| 5 | Verification | `/sprint-verify` | All sprint artifacts | Fixes, verification-report.md, PR | `references/phase-5-verification.md` |

**Phase 4 concurrency:** 2 workers running simultaneously (no total cap — spawn as many as needed, only 2 active at once). Workers pick up stories from the queue as they finish.

## Multi-Agent Philosophy

Teams are mandatory. Every phase uses `TeamCreate` + `Task` with `team_name` to spawn teammates.

**Lead agent rules:**
- Pure orchestrator. Never reads source code. Never implements.
- Only uses: TeamCreate, Task, SendMessage, TaskCreate/Update/List, TeamDelete
- Reads ONLY sprint artifacts (README, progress.md, stories)
- Delegates ALL research and implementation to teammates

**Worker agent rules:**
- Implements. Does NOT orchestrate or spawn other agents.
- MUST create a task list (TaskCreate) before any work
- Loads relevant skills as specified in story files (via ToolSearch / skill discovery)
- Follows the story workflow: research, think, plan, implement, test, review, commit
- See `references/worker-guide.md` for complete instructions

**What we NEVER use:**
- `Task` without `team_name` (creates subagents — forbidden)
- `run_in_background: true` on Task calls (creates background agents — forbidden)
- `subagent_type: "Explore"` for implementation work

## Story Sizing — The Central Rule

A story is a complete, deployable unit of work. NOT a single file change. NOT one endpoint. The whole feature or fix, end to end.

| Constraint | Value | Rationale |
|-----------|-------|-----------|
| Stories per sprint | **4-8** (typical), **12-15** max | Each story start costs ~20K tokens in context setup. Fewer stories = less overhead, more implementation time. |
| Files per story | **10-30** | The agent handles 30 files fine. It loses track above 40. |
| Lines changed per story | **500-2000** | The agent can produce 2000 lines in one session. Below 500 is wasteful overhead. |
| Tasks per story | **5-12** | Each task is a substantial deliverable: a complete component, a full API endpoint with tests, an entire schema migration. |
| Agent time per story | **20-30 min** | Well-packed stories keep the agent productive for a full session. Under 20 min means too much overhead relative to work. |

### Packing Rules

If you can describe two stories in one sentence ("add the client CRM with list, detail, and edit views"), they should be ONE story. Only split when the combined work genuinely exceeds 2000 lines or 30 files.

- **One feature = one story.** "Add client CRM with list, detail, edit, and create" is one story if it fits.
- **Bug packing:** Group 3-5 related bugs into a single story. "Fix navigation bugs" with 5 specific bugs is ONE story, not five.
- **Tests ship with features.** Never create a "write tests" story. Tests are part of the feature story.
- **Refactors:** One refactoring goal = one story. "Migrate all sidebar components to new layout system" is one story.

### When to Split

Split ONLY when:
- Combined scope genuinely exceeds 30 files or 2000 lines
- The work has hard sequential dependencies where later work CANNOT start until earlier work is deployed
- The domains are completely unrelated (e.g., billing system + whiteboard editor)

### When NOT to Split

Keep together when:
- Schema + backend + frontend for one feature (vertical slice)
- Feature + its tests (tests are part of the feature)
- Related bugs in the same area (pack them)
- A component + its styling (same story)
- The work shares a domain or can be described in one sentence

### Anti-pattern: Too Many Stories

If your sprint has 30 stories when 10 would do, you have broken things down too far. Every story has ~20K tokens of overhead (reading AGENTS.md, sprint README, progress.md, story file, discovering skills, creating task list). That's 600K tokens of overhead for 30 stories vs 200K for 10.

**Justify your story count.** If challenged, you should be able to explain why each story cannot be merged with another.

## Sprint Folder Structure

All sprint artifacts live in `sprints/<name>/` at the repo root:

```
sprints/<name>/
├── research.md                   # Phase 1 output
├── plan.md                       # Phase 1 output
├── README.md                     # Phase 2 output (sprint overview)
├── stories/
│   ├── STORY-001.md
│   ├── STORY-002.md
│   └── ...
├── verification-checklist.md     # Phase 3 output
├── progress.md                   # Phase 4 (memory file, append-only)
├── sprint-completion.md          # Phase 4 output
└── verification-report.md        # Phase 5 output
```

**Branch:** `sprint/<name>` — created at Phase 1 start. All artifacts committed throughout all phases.

## Compaction Survival

Context compaction WILL happen during sprints. When it does:

1. **TaskList** — Your task list survives compaction. Read it FIRST.
2. **README.md** — Re-read the sprint README immediately.
3. **progress.md** — Read for current state and insights.
4. **Continue** from where your task list says you are.

**NEVER work from memory.** If you cannot point to a file or task list entry, you do not know it.

## Tool Reference

Every action in this protocol maps to a Codex tool:

| Action | Tool | Required Parameters |
|--------|------|-------------------|
| Create team | `TeamCreate` | `team_name` |
| Spawn teammate | `Task` | `team_name`, `name`, `model`, `subagent_type`, `prompt` |
| Send message | `SendMessage` | `type`, `recipient`, `content` |
| Shut down teammate | `SendMessage` | `type: "shutdown_request"`, `recipient` |
| Clean up team | `TeamDelete` | (none) |
| Create task | `TaskCreate` | `subject`, `description` |
| Update task | `TaskUpdate` | `taskId`, `status` |
| Read task list | `TaskList` | (none) |

## Platform Notes

### Codex (Primary)
Full team support. All phases run natively. This protocol is designed for Codex first.

### Codex Multi-Agent
- Use worker/explorer agent types instead of teammate naming
- Sandbox policy requires explicit file access grants
- Parallel spawning supported — adjust max workers accordingly
- See Phase 4 reference for Codex-specific notes

### Cursor Agent (Primary for Phase 5)
- Cursor Agent is the PRIMARY platform for Phase 5 (Verification)
- Video evidence is mandatory during verification — every check must produce visual proof
- See `.cursor/rules/sprint-protocol.mdc` for the expanded Cursor-specific workflow
- Browser verification via Cursor's built-in tools
- Single-agent verification (no teams in Cursor)

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Using subagents (Task without team_name) | No coordination, no shared memory | Always use `Task` with `team_name` |
| Background agents (run_in_background) | Uncontrolled, can't communicate | Never use background agents |
| Lead reading source code | Fills context with code, loses orchestration state | Delegate ALL research to teammates |
| Working from memory after compaction | Hallucinated state, missed work | TaskList, README, progress.md, continue |
| 20+ stories in a sprint | Massive token overhead | Pack more work per story (4-8 typical) |
| One-file stories | Overhead dwarfs implementation | Pack related changes together |
| Splitting by layer (horizontal) | Non-functional intermediate states | Vertical slices through all layers |
| Skipping TaskCreate | Drift, incomplete work, no compaction recovery | Task list is ALWAYS first action |
| Browser verification during execution (Phase 4) | Slows workers, unreliable mid-implementation | All browser verification in Phase 5 only |
| Loose, granular stories | 30 stories when 10 would do | Justify story count, pack aggressively |
| Lead implementing "small fixes" | Scope creep, role violation | Every fix goes to a teammate |
| Ignoring unrelated test failures | Broken tests accumulate, CI rots | Workers must fix them constructively, not skip them |
| Skipping video evidence in verification | No proof that features actually work | Video evidence is mandatory in Phase 5, not optional |
