# Phase 1: Research & Plan

Research the codebase, synthesize findings, and produce a sprint plan.

**Command:** `/sprint-research`
**Team config:** Unlimited research teammates (based on topics) + 1 plan writer
**Deliverables:** research.md, plan.md (committed to `sprint/<name>` branch)

## Phase 1 Workflow

### 1. Interview the User

Use `AskUserQuestion` to gather requirements:
- What needs to change? Why?
- What is in scope? What is explicitly out?
- Any reference products or designs? ("Like Linear's X", "Similar to Notion's Y")
- Any technical constraints or preferences?
- **Always ask: "Do you have more requirements or context to share?"**

Continue until you have enough to identify research topics.

### 2. Create Branch and Sprint Folder

```bash
git checkout -b sprint/<name>
mkdir -p sprints/<name>/stories
```

All artifacts will be committed to this branch throughout all phases.

### 3. Analyze Brain Dump -> Identify Research Topics

From the user's input, identify **independent research topics**. These are areas of the codebase that can be investigated in parallel without overlap.

Examples:
- "Authentication flow" -- one topic
- "Dashboard layout" -- another topic
- "API endpoints for billing" -- another topic
- "Database schema for users" -- another topic

**There is NO CAP on research topics.** If the user's requirements touch 7 independent areas, create 7 research tasks.

### 4. Create Task List

Call `TaskCreate` for every research topic:
- Subject: "Research: [topic name]"
- Description: "Investigate [area], document files/patterns/gaps"

This is your memory anchor. It survives compaction.

### 5. Create Research Team

```
TeamCreate:
  team_name: "sprint-<name>-research"
```

### 6. Spawn Research Teammates

**Spawn ONE teammate per independent research topic.** No cap. If there are 5 topics, spawn 5 teammates. If there are 10 topics, spawn 10 teammates.

Each teammate investigates one area and reports back with findings.

Use the Research Teammate Spawn Template below for each.

### 7. Wait for All Reports

As teammates complete:
- Read their findings
- Note any overlap or conflicts between research areas
- Identify gaps -- areas the user mentioned but no researcher covered
- If gaps exist, spawn additional researchers

### 8. Synthesize and Write research.md

After all research is in, the **lead writes research.md** themselves. This is synthesis work -- combining all findings into a coherent picture.

Use the template from `references/templates.md`. The research.md must include:
- Overview of what was investigated
- Per-area findings with file paths and line numbers
- Schema state
- Cross-cutting concerns
- Open questions

### 9. Spawn Plan Writer

After research.md is written, spawn **ONE dedicated plan-writer teammate** to produce plan.md. This is a separate teammate because plan writing requires:
- Reading all of research.md
- Thinking about optimal story sizing, number, and order
- Considering what each story writer will need to research in Phase 2
- Justifying the story count

Use the Plan Writer Spawn Template below.

### 10. Review plan.md

When the plan writer reports back:
- Read plan.md
- Verify story count is justified (4-8 typical, max 15)
- Verify stories are properly sized (10-30 files, 500-2000 lines each)
- Verify dependencies make sense
- Verify each story has research items for the Phase 2 writer

**Packing review:**
- Is packing sound? Could any stories be merged further without exceeding size limits?
- Are related changes split across stories that should be one vertical slice?
- Are any stories overloaded (too many concerns, >30 files)? Split them.
- Are any stories too thin (<10 files, <500 lines)? Merge them into a neighbor.

**Ordering review:**
- Is execution order justified? Do earlier stories build foundations for later ones?
- Do dependency chains make sense? Could reordering reduce blocked time?
- Are high-risk stories scheduled early (fail fast) or late (stable foundation first)?

**Efficiency review:**
- Does the sprint efficiency assessment check out? Are estimates realistic?
- Are there parallelism opportunities between independent stories?
- Is the total scope achievable? Flag if estimates exceed reasonable bounds.

### 11. Cleanup After Research

After research.md and plan.md are finalized, clean up any temporary files that research worker agents may have created. Only research.md and plan.md should survive Phase 1 — keep artifacts minimal.

```bash
# Check for any stray files in the sprint folder
ls sprints/<name>/
# Remove anything that isn't research.md or plan.md
# (e.g., scratch notes, temp analysis files, debug output)
find sprints/<name>/ -type f ! -name 'research.md' ! -name 'plan.md' -delete
```

If researchers created files outside the sprint folder, remove those too. The sprint branch should be clean — only the two deliverables committed.

### 12. Commit Artifacts

```bash
git add sprints/<name>/research.md sprints/<name>/plan.md
git commit -m "Sprint <name>: Phase 1 — research and plan"
```

### 13. Shut Down Team

```
SendMessage: type: "shutdown_request" to each teammate
TeamDelete
```

### 14. Report to User

Present:
- Sprint goal (from plan.md)
- Number of proposed stories with brief descriptions
- Scope in/out
- Any open questions
- Ask: "Ready to proceed to Phase 2 (Story Writing)?"

---

## Research Teammate Spawn Template

```
Task tool parameters:
  team_name: "sprint-<name>-research"
  name: "researcher-<topic>"
  model: "sonnet"
  subagent_type: "general-purpose"
  prompt: |
    You are a research teammate for Sprint <name>.

    TASK: Investigate [TOPIC] and document your findings.

    STEPS:
    1. Read CLAUDE.md for project context and conventions
    2. Read these specific files:
       - [file paths relevant to this topic]
    3. Explore related files — look for patterns, utilities, dependencies
    4. Document your findings with EXACT file paths and line numbers

    REPORT FORMAT:
    Return a structured report:

    ## [Topic Name]
    **Current state:** [What exists today]
    **Files:**
    - `path/to/file.ts:line` — [What it does]
    - `path/to/other.ts:line` — [What it does]
    **Patterns:** [How similar things are done]
    **Gaps:** [What's missing or broken]
    **Schema:** [Relevant fields/indexes]
    **Dependencies:** [What depends on this code]
    **Recommendations:** [Suggested approach for implementation]

    WHAT TO LOOK FOR:
    - File structure and naming conventions in this area
    - Existing patterns: how similar features/components are built
    - Dependencies: what this code imports, what imports this code
    - Test coverage: what tests exist, what's untested, test patterns used
    - Known issues: TODOs, FIXMEs, hack comments, stale code
    - Config and environment: relevant env vars, feature flags, settings

    HOW TO INVESTIGATE:
    - Start from entry points (routes, exports, main components)
    - Trace call chains 2-3 levels deep — understand the data flow
    - Read existing tests — they reveal intended behavior and edge cases
    - Check for TODOs/FIXMEs — they reveal known debt and planned work
    - Look at recent git history for the area — what changed recently and why
    - Read adjacent code — sibling files often reveal conventions

    DOCUMENTATION REQUIREMENTS:
    - Every finding MUST include exact file paths and line numbers
    - Include short code snippets (3-8 lines) for key patterns
    - Describe patterns in enough detail that a story writer can follow them
    - Note type signatures and interfaces that constrain implementation

    RULES:
    - Include exact file paths and line numbers
    - Note existing patterns that should be followed
    - Flag potential conflicts with other areas
    - Do NOT write story files — just report findings
    - Do NOT implement anything
    - Do NOT create temporary files. Report findings via SendMessage.
```

---

## Plan Writer Spawn Template

```
Task tool parameters:
  team_name: "sprint-<name>-research"
  name: "plan-writer"
  model: "sonnet"
  subagent_type: "general-purpose"
  prompt: |
    You are the plan writer for Sprint <name>.

    TASK: Read the research findings and produce plan.md.

    READ FIRST:
    1. CLAUDE.md — project context
    2. sprints/<name>/research.md — all research findings

    THEN THINK ABOUT:
    - How many stories are needed? (target 4-8, max 15)
    - What is the right sizing for each? (10-30 files, 500-2000 lines, 5-12 tasks)
    - What order should stories be implemented in? Why this order?
    - What does each story writer need to research in Phase 2?
    - Can any proposed work be merged into fewer stories?
    - JUSTIFY your story count — explain why N stories, not N-1 or N+1

    PLAN.MD QUALITY REQUIREMENTS:
    - Document the total number of stories and the rationale for that count
    - Specify execution order with explicit justification (dependency chains, risk reduction, foundation-first)
    - Describe packing strategy: what got merged into what, and why
    - Include a sprint efficiency assessment: estimated total files, lines, agent time, and parallelism opportunities
    - Every decision must be justified — not just "5 stories" but "5 stories because X, Y, Z"
    - Reference the enhanced plan.md template from references/templates.md for full structure

    PRODUCE:
    Write sprints/<name>/plan.md using this structure:

    # Sprint: <name> — Plan

    ## Sprint Goal
    [1-2 sentences]

    ## Scope
    ### In Scope
    - [items]
    ### Out of Scope
    - [items]

    ## Proposed Stories
    | ID | Title | Brief | Tier | Research Items |
    |----|-------|-------|------|----------------|
    (one row per story)

    ### Story Count Justification
    [Why this number? Why not fewer?]

    ## Dependencies
    [Cross-story dependencies with reasons]

    ## Complexity Estimates
    - Total files: ~N
    - Total lines changed: ~N

    ## Phase Gates
    [Where to insert quality gates between stories]

    SIZING RULES:
    - Each story: 10-30 files, 500-2000 lines, 5-12 tasks, 20-30 min agent time
    - Pack features: "Add CRM with list+detail+edit" = ONE story
    - Pack bugs: 3-5 related bugs = ONE story
    - Tests ship with features, never separate
    - Vertical slices only — no "schema story" + "frontend story"
    - The "Research Items" column is critical — tell the Phase 2 story writer what to investigate
```

---

## research.md Format

See `references/templates.md` for the full template. Key sections:
- Overview
- Feature Areas (with file paths, current state, patterns, gaps)
- Schema State
- Cross-Cutting Concerns
- Open Questions

---

## plan.md Format

See `references/templates.md` for the full template. Key sections:
- Sprint Goal
- Scope (In/Out)
- Proposed Stories table (ID, Title, Brief, Tier, Research Items)
- Story Count Justification
- Dependencies
- Complexity Estimates
- Phase Gates

---

## Compaction Recovery

If compaction happens during Phase 1:
1. `TaskList` -- see which research topics are done
2. Read `sprints/<name>/research.md` if it exists
3. Continue from where your task list says you are
