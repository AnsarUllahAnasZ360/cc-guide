# Phase 5: Verification

Verify all sprint work, fix issues as you go, produce a verification report with evidence, and create the pull request.

**Command:** `/sprint-verify`
**Deliverables:** verification-report.md (with evidence links), fixes committed, PR created
**Prerequisites:** sprint-completion.md exists, all stories implemented

---

## Cursor Agent Verification Workflow (Primary)

This is the primary verification path. Cursor Agent runs as a single agent with direct browser access, making it ideal for thorough, evidence-driven verification.

### Step 1: Set Up Environment

Before any verification, ensure the full development environment is running:

1. **Dev server** -- start it and confirm it responds (e.g., `npm run dev`, `pnpm dev`)
2. **Database** -- seeded with test/dev data if applicable
3. **External services** -- any APIs, queues, or background workers the app depends on
4. **Environment variables** -- `.env` or `.env.local` populated correctly

Do NOT proceed until the app is fully running. Verification against a broken environment produces false failures.

```bash
# Example — adapt to the project
npm run dev          # start dev server
npm run db:seed      # seed database (if applicable)
```

Confirm the app loads in browser before moving on.

### Step 2: Load Sprint Branch

```bash
git checkout sprint/<name>
git log --oneline -5    # confirm you are on the correct branch
```

Verify the branch tip matches what was committed in Phase 4. If the branch is behind or diverged, investigate before proceeding.

### Step 3: Read ALL Context

Read every one of these files **in full**. Do not skim. Do not skip entries.

1. **CLAUDE.md** -- project context, conventions, tech stack
2. **`sprints/<name>/README.md`** -- sprint goal, stories, scope, dependencies
3. **`sprints/<name>/progress.md`** -- read EVERY entry, top to bottom. This contains worker insights, blockers encountered, decisions made, and deviations from plan. Understanding what happened during execution is critical to accurate verification.
4. **`sprints/<name>/stories/STORY-*.md`** -- read ALL story files. Understand acceptance criteria, scope, and any noted limitations.
5. **`sprints/<name>/sprint-completion.md`** -- Phase 4 execution results. What was completed, what was deferred, known issues.
6. **`sprints/<name>/verification-checklist.md`** -- the checklist you will verify against (Phase 3 output).

**Why this matters:** Verification without full context leads to false passes (missing a broken feature because you did not know it was supposed to exist) and false failures (flagging intentional decisions as bugs). Build a complete mental model of the sprint before verifying anything.

### Step 4: Understand What Was and Was Not Implemented

After reading all context, explicitly enumerate:

- **Implemented:** Features, routes, components, APIs that were built
- **Deferred/Descoped:** Items noted in sprint-completion.md as out of scope or deferred
- **Known issues:** Problems acknowledged during execution that may still be present
- **Deviations:** Places where implementation diverged from the original story spec (and why)

This mental model guides your verification. You verify what was built, confirm deferred items are not half-implemented (no dead code, no broken stubs), and distinguish known issues from new bugs.

### Step 5: Create Task List

Create a task for every item in `verification-checklist.md`, plus global checks:

1. Run global checks (typecheck, lint, tests, build)
2. One task per verification-checklist item (or group closely related items)
3. Run final global checks after all fixes
4. Write verification-report.md
5. Create pull request

This task list is your progress tracker. Mark tasks as you complete them so you (and compaction recovery) know exactly where you are.

### Step 6: Run Global Checks

Run the full suite of project health checks before any feature verification:

```bash
# Adapt commands to the project
npx tsc --noEmit       # typecheck
npm run lint           # lint
npm test               # tests
npm run build          # build
```

**Record every result.** These form the "before" baseline for your verification report.

| Result | Action |
|--------|--------|
| All pass | Proceed to feature verification |
| Minor failures (<10 errors) | Note them, proceed — fix during verification |
| Catastrophic failures (50+ errors, build broken) | STOP. Report to user before continuing |

### Step 7: Verify Checklist Items (The Core Loop)

Work through the verification checklist **item by item**. Do not skip items. Do not stop early. Continue until EVERY item is verified.

For each checklist item:

#### 7a. Navigate to the Page/Route

Open the relevant page, route, or UI in the browser. If the check is backend-only, use the appropriate tool (curl, test runner, database query).

#### 7b. Verify Expected Behavior

Check that the feature works as described in the acceptance criteria:
- Does the UI render correctly?
- Do interactive elements (buttons, forms, links) function?
- Does data load, save, and display correctly?
- Do error states and edge cases behave as specified?

#### 7c. Check for Errors

- **Console:** No JavaScript errors, no unhandled promise rejections, no React/framework warnings that indicate bugs
- **Network:** No failed API requests (4xx, 5xx) that should succeed. No CORS errors. No missing resources.
- **Server logs:** No unhandled exceptions or error stack traces

#### 7d. Record Video Evidence (MANDATORY)

**Every verification check MUST have recorded evidence.**

- **Interactive flows** (form submissions, navigation, drag-and-drop, animations): Record a GIF or short video showing the flow working end-to-end
- **Static checks** (page renders, data displays, layout): Screenshot with relevant state visible
- **Console/network checks:** Screenshot the console or network panel showing clean state (or the error, if failing)
- **Backend-only checks:** Screenshot of test output, curl response, or database state

Evidence is referenced in verification-report.md. Without evidence, a "PASS" is not credible.

#### 7e. If PASS: Record and Move On

Log the result with evidence reference. Move to the next checklist item.

#### 7f. If FAIL: Fix Immediately

**This is the "fix as you go" principle.** Do NOT batch failures for later. When you find an issue:

1. **Diagnose** the root cause immediately
2. **Fix** the code — make the minimal change needed
3. **Run typecheck and tests** to confirm the fix does not break anything else
4. **Re-verify** the checklist item — navigate back, confirm it now works
5. **Record evidence** of the fix working (new GIF/screenshot)
6. **Commit the fix:**
   ```bash
   git add <changed-files>
   git commit -m "[FIX] Sprint <name>: brief description of fix"
   ```
7. Move to the next checklist item

**When NOT to fix immediately:**
- The issue requires major architectural changes (document as outstanding, recommend NEEDS WORK)
- The fix would take longer than the rest of verification combined (document, escalate)
- The issue is in deferred/descoped work (confirm it is cleanly deferred, not half-broken)

In these cases, document the issue with full details in the verification report and continue.

#### 7g. Continue Until DONE

**Do not stop early.** The model needs to validate from its computer that everything works. Every checklist item must be verified with evidence. If you have verified 8 of 12 items, you are not done — continue through items 9, 10, 11, and 12.

If compaction happens mid-verification, see the Compaction Recovery section.

### Step 8: Run Final Global Checks

After all checklist items are verified and all fixes are committed:

```bash
npx tsc --noEmit       # typecheck
npm run lint           # lint
npm test               # tests
npm run build          # build
```

Compare results to your Step 6 baseline. All checks should pass. If new failures appeared (a fix broke something else), fix them now.

### Step 9: Write verification-report.md

Write `sprints/<name>/verification-report.md` using the template from `references/templates.md`.

The report MUST include:

- **Global check results** -- typecheck, lint, tests, build (before and after)
- **Per-checklist-item results** -- PASS/FAIL with evidence links for each
- **Per-story summary** -- rollup of checklist items by story
- **All fixes applied** -- file paths, descriptions, commit hashes
- **Outstanding issues** -- anything too large or risky to fix during verification
- **Evidence inventory** -- list of all GIFs, videos, screenshots produced
- **Final recommendation:** MERGE or NEEDS WORK
  - If NEEDS WORK: specific items requiring manual attention and why

```bash
git add sprints/<name>/verification-report.md
git commit -m "Sprint <name>: Phase 5 — verification report"
```

### Step 10: Create Pull Request

Create the PR from the sprint branch to main:

```bash
gh pr create \
  --base main \
  --head sprint/<name> \
  --title "Sprint: <name> — <sprint goal>" \
  --body "$(cat <<'EOF'
## Sprint: <name>

**Goal:** <sprint goal from README>

## Stories
| # | Title | Status |
|---|-------|--------|
| STORY-001 | ... | verified |
| STORY-002 | ... | verified |

## Verification
- TypeScript: PASS/FAIL
- Lint: PASS/FAIL
- Tests: PASS/FAIL (N passed, N failed)
- Build: PASS/FAIL
- Browser: PASS/FAIL/N/A

## Evidence
All verification evidence (GIFs, screenshots) is referenced in the verification report.

## Verification Report
See `sprints/<name>/verification-report.md` for full details.

---
Generated by AgentX Sprint Protocol
EOF
)"
```

If tests fail and you cannot fix them:
- Create the PR as draft: `gh pr create --draft ...`
- Note failures prominently in the PR body
- Set recommendation to NEEDS WORK

### Step 11: Report to User

Present:
- Verification summary (pass/fail counts per checklist item and per story)
- Fixes applied during verification (count and brief descriptions)
- Outstanding issues (if any) with explanations
- Evidence summary (number of GIFs/screenshots produced)
- PR link
- Final recommendation: MERGE or NEEDS WORK
- If NEEDS WORK: specific items that need manual attention and what to do about them

---

## Key Principles

These principles apply regardless of which verification path you use.

### Fix As You Go

The old approach of "report all failures, then batch-fix at the end" is replaced by **fix as you go**. When you find an issue during verification:

1. Fix it immediately (unless it requires major architectural changes)
2. Re-verify the item
3. Record evidence of the fix working
4. Commit the fix
5. Continue to the next item

This eliminates the problem of fixes cascading (fix A breaks check B, which was already "passed") and produces a cleaner, more trustworthy verification.

### Video Evidence is Mandatory

Every verification check must have recorded evidence. This is not optional.

- GIF/video for interactive flows (clicking, typing, navigating, submitting)
- Screenshots for static state (page renders, data displays, console output)
- Evidence is referenced by filename in verification-report.md

Without evidence, the verification report is just a list of claims. Evidence makes it auditable.

### Thoroughness Over Speed

Do not stop at the first few checklist items. Do not skip items that "probably work." Do not mark items as PASS without actually checking them.

**The model needs to validate from its computer that everything works.** Every checklist item. Every acceptance criterion. With evidence.

If verification is taking a long time, that is fine. A thorough verification that catches bugs is worth far more than a fast verification that misses them.

---

## Claude Code Alternative (Fallback)

When Cursor Agent is not available, use Claude Code's team-based verification. This approach spawns verifier teammates and fix workers to parallelize the work.

**Note:** This path lacks direct browser access (unless MCP browser tools are configured). Browser verification items will be marked "NOT VERIFIED -- manual verification needed" unless browser tooling is available.

### Claude Code Workflow Overview

1. **Load context** -- read the same files as Step 3 above (CLAUDE.md, README, progress.md in full, all stories, sprint-completion.md, verification-checklist.md)
2. **Create task list** -- global checks, spawn verifiers, triage, fix, re-verify, report, PR
3. **Run global checks** -- typecheck, lint, tests, build
4. **Create team and spawn verifiers:**
   ```
   TeamCreate: team_name: "sprint-<name>-verify"
   ```
   Spawn verifiers grouped by 2-3 stories each (use Verifier Template below). Verifiers report only -- they do not fix.
5. **Collect verifier reports** -- per-story pass/fail, specific failures with file paths, severity classifications
6. **Triage failures:**
   | Severity | Definition | Action |
   |----------|-----------|--------|
   | Critical | Tests fail, typecheck errors, broken functionality | Must fix before PR |
   | Warning | Missing edge case, incomplete acceptance criteria | Fix if possible, document if not |
   | Minor | Style issues, polish, documentation gaps | Document for follow-up |
7. **Spawn fix workers** -- one per issue group, using Fix Worker Template below
8. **Re-verify after fixes** -- run global checks again. Max 3 fix rounds, then escalate.
9. **Browser verification** -- if MCP browser tools available, spawn browser-verification teammate. Otherwise mark as N/A.
10. **Write verification-report.md** and commit
11. **Create PR** (same format as Cursor path above)
12. **Shut down team:**
    ```
    SendMessage: type: "shutdown_request" to each teammate
    TeamDelete
    ```
13. **Report to user**

### Verifier Teammate Template

```
Task tool parameters:
  team_name: "sprint-<name>-verify"
  name: "verifier-<batch>"
  model: "sonnet"
  subagent_type: "general-purpose"
  prompt: |
    You are a verification teammate for Sprint <name>.

    TASK: Verify stories [STORY-XXX, STORY-YYY] against the codebase.

    READ THESE FILES:
    1. CLAUDE.md — project context
    2. sprints/<name>/README.md — sprint overview
    3. sprints/<name>/verification-checklist.md — what to check
    4. sprints/<name>/stories/STORY-XXX.md — story details
    5. sprints/<name>/stories/STORY-YYY.md — story details

    FOR EACH STORY, VERIFY:
    1. All acceptance criteria are met (check the actual code)
    2. Unit tests exist and cover the implementation
    3. No files modified outside the story's stated scope
    4. Code follows project conventions (from CLAUDE.md)
    5. Error handling is present where needed
    6. No obvious security issues (injection, XSS, etc.)
    7. No unused imports or dead code introduced

    REPORT FORMAT:
    ## STORY-XXX: [Title]
    **Status:** PASS / FAIL
    **Acceptance criteria:**
    - [Criterion 1]: PASS / FAIL — [details]
    - [Criterion 2]: PASS / FAIL — [details]
    **Tests:** [N tests found, all passing / N failing]
    **Issues:**
    - [severity: critical/warning/minor] [description] — `file:line`
    **Browser:** [N/A — browser verification handled separately]

    RULES:
    - Include exact file paths and line numbers for all issues
    - Classify every issue by severity (critical/warning/minor)
    - Do NOT fix anything — report only
    - Do NOT implement missing features — report as FAIL
```

### Fix Worker Template

```
Task tool parameters:
  team_name: "sprint-<name>-verify"
  name: "fix-<issue-area>"
  model: "sonnet"
  subagent_type: "general-purpose"
  prompt: |
    You are a fix worker for Sprint <name> verification.

    TASK: Fix these specific issues found during verification.

    ISSUES TO FIX:
    1. [description] — `file:line`
    2. [description] — `file:line`

    READ FIRST:
    1. CLAUDE.md — project context and conventions
    2. The files containing the issues

    RULES:
    - Fix ONLY the listed issues. Do not refactor or improve surrounding code.
    - Run typecheck after your fix — must pass with zero errors
    - Run tests after your fix — must pass
    - Commit with message: "[FIX] Sprint <name>: brief description"
    - Report what you fixed and any issues you could not resolve

    REPORT FORMAT:
    **Fixed:**
    - `file:line` — [what was wrong, what you changed]
    **Could not fix:**
    - [description and reason]
    **Verification:**
    - Typecheck: PASS / FAIL
    - Tests: PASS / FAIL
```

### Fix Escalation Protocol

Fixes during verification must be scoped and controlled:

1. **Round 1:** Fix all critical issues. Run global checks.
2. **Round 2:** Fix remaining warnings. Run global checks.
3. **Round 3:** Final attempt on any lingering failures. Run global checks.
4. **After round 3:** If issues remain, document in verification-report.md as outstanding. Recommend NEEDS WORK and explain what manual attention is needed.

Never enter an infinite fix loop. Three rounds maximum.

---

## Platform Notes

| Platform | Verification Path | Browser Access | Team Support |
|----------|------------------|----------------|--------------|
| **Cursor Agent** | Primary (above) | Built-in browser tools | Single agent, no teams needed |
| **Claude Code** | Alternative (above) | MCP browser tools or N/A | Full team support |
| **Codex Multi-Agent** | Adapt Claude Code path | Not available (mark N/A) | Worker agents in sandbox |

---

## Compaction Recovery

If compaction happens during Phase 5:

1. `TaskList` -- see which verification steps are completed
2. Read `sprints/<name>/verification-report.md` if it exists (partial results saved)
3. Read `sprints/<name>/sprint-completion.md` for execution state
4. Read `sprints/<name>/progress.md` to re-establish context
5. Continue from where your task list says you are -- do not re-verify completed items
6. If mid-fix when compaction hit, check `git log` for any fix commits already made
