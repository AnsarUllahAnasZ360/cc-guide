# Sprint Artifact Templates

Use these templates as the standard artifact contract for Claude/Cloud Code Sprint Protocol and the Codex plugin.

## Sprint Folder Contract

Every executable sprint folder uses the same contract:

```text
sprints/<sprint-name>/
  research.md
  plan.md
  README.md
  stories/
    STORY-001.md
  verification-checklist.md
  progress.md
  sprint-completion.md
```

`verification-report.md` and `evidence/` are created later only when Phase 5 verification is run or when a checkpoint sprint explicitly performs QA evidence work.

For multi-sprint work, create independent sprint folders:

```text
sprints/<initiative>-01-<feature>/
sprints/<initiative>-02-<feature>/
sprints/<initiative>-checkpoint-03-<theme>/
```

Each folder must stand alone. A future agent should be able to open one sprint folder and understand what to do without reading the original chat.

## Optional Multi-Sprint Distribution

Create this only when the user needs a durable overview before approving several sprint folders.

```markdown
# <Initiative> - Sprint Distribution

## Source Inputs
- <raw founder notes, file paths, docs, chats, issues, PRDs>

## Why This Needs Multiple Sprints
<Explain scope, dependency order, verification burden, and risk.>

## Sprint Sequence
| Order | Sprint Folder | Type | Goal | Feature Deliverables | Difficulty | Depends On | Verification/Checkpoint |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | `sprints/<initiative>-01-<feature>` | implementation | <goal> | <deliverables> | hard | none | <handoff> |
| 02 | `sprints/<initiative>-02-<feature>` | implementation | <goal> | <deliverables> | medium | 01 | <handoff> |
| 03 | `sprints/<initiative>-checkpoint-03-<theme>` | checkpoint | <goal> | code review + browser QA | hard | 01-02 | Phase 5 recommended |

## Dependency Logic
- <why this order makes sense>

## Checkpoint Strategy
- <where checkpoints happen and why>

## Founder Decisions
- <decision needed or approved>
```

## Sprint `research.md`

```markdown
# Sprint: <name> - Research

## Source Inputs
- <raw founder notes, file paths, docs, chats, issues, PRDs>

## Intake Mode
Raw intake | Baked packet review

## Objective
<What the founder wants built and why.>

## Multi-Sprint Context
<If this is one sprint in a larger initiative, state the previous sprint, next sprint, and dependency position. If not applicable, say N/A.>

## Findings

### <Area>
**Current state:** <summary>

**Evidence:**
- `path/to/file.ts:line` - <finding>

**Patterns:** <local conventions>
**Gaps:** <missing pieces>
**Risks:** <risk and mitigation>
**Sprint implications:** <what story writers need to know>

## Gaps And Questions
- <question or none>

## One Sprint Fit Assessment
<Why this specific sprint scope fits into one sprint. If the original input was larger, explain how this sprint was bounded.>
```

## Sprint `plan.md`

```markdown
# Sprint: <name> - Plan

## Goal
<1-2 sentences.>

## Scope

### In
- <included>

### Out
- <excluded>

## Position In Larger Initiative
- previous sprint: <name or none>
- this sprint delivers: <feature/outcome>
- next sprint: <name or none>
- checkpoint after this sprint: yes/no and why

## Why This Fits One Sprint
<Explain the scope boundary, dependency shape, and verification burden.>

## Proposed Stories
| ID | Title | Type | Difficulty | Purpose | Dependencies | Required Skills | Targeted Tests |
| --- | --- | --- | --- | --- | --- | --- | --- |
| STORY-001 | <title> | feature | hard | <why> | none | <skills> | <commands> |

## Story Count Rationale
<Why this exact set of stories is enough and not artificially split.>

## Execution Order
- STORY-001 first because <reason>.
- STORY-002 can run with STORY-003 because <reason>.

## Recommended Concurrency
<1-4, with rationale. Final choice is confirmed during Phase 4.>

## Skill Strategy
- <frontend/backend/AI/verification skill notes>

## Testing Strategy
- per-story targeted tests
- red/green proof for testable changes
- sprint-level checks before commit
- browser/API verification in Phase 5 when user requests QA

## Difficulty And Model Routing
- Hard stories: <ids>
- Medium stories: <ids>
- Simple stories: <ids>

## Branch And Commit Assumptions
- branch: <current or sprint/name>
- commit: one sprint commit by default

## Risks And Tradeoffs
- <risk and mitigation>
```

## Sprint `README.md`

```markdown
# Sprint: <name>

## Goal
<single most important outcome>

## Type
implementation | checkpoint

## Scope

### In Scope
- <item>

### Out Of Scope
- <item>

## Stories
| ID | Title | Type | Difficulty | Status | Dependencies | Required Skills | Targeted Tests |
| --- | --- | --- | --- | --- | --- | --- | --- |
| STORY-001 | <title> | feature | hard | pending | none | <skills> | <commands> |

## Execution Guidance
- recommended concurrency: <1-4>
- branch recommendation: <branch>
- commit policy: one sprint commit
- dependency order: <summary>

## Success Criteria
1. <measurable outcome>
2. Feature-level tests pass.
3. Sprint-level checks pass or documented blockers exist.
4. `sprint-completion.md` clearly hands off what Phase 5 should verify if QA is requested.
```

## `verification-checklist.md`

```markdown
# Sprint: <name> - Verification Checklist

## Source Documents
- README.md
- stories/STORY-*.md
- plan.md
- progress.md
- sprint-completion.md

## Global Checks Before Final Verdict
- [ ] `<typecheck command>` - expected: zero sprint-caused errors
- [ ] `<lint command>` - expected: zero sprint-caused errors
- [ ] `<targeted feature test suite>` - expected: pass
- [ ] `<build command>` - expected: build succeeds when applicable

## Per-Story Checks

### STORY-001: <title>
- [ ] Feature-level tests pass: `<command>`
- [ ] Acceptance criterion: <criterion> - verify by <command/browser/API flow>
- [ ] Phase 5 evidence to collect if requested: <screenshot/recording/log path or N/A>

## Code Review Checks
- [ ] Spec compliance review completed
- [ ] Code quality review completed
- [ ] Security/permissions reviewed where relevant
- [ ] No unrelated files changed

## Browser/API Checks
- [ ] <route or workflow> - expected: <result> - Phase 5 evidence target: <path or N/A>

## Environment
- <services, credentials, seed data, local URL>
```

## `progress.md`

```markdown
# Sprint: <name> - Progress

> Append-only worker ledger. Every worker reads all relevant entries before editing.

---

## STORY-001 - <title>
**Status:** completed | partial | blocked
**Worker:** <worker name>
**Difficulty:** hard | medium | simple
**Required Skills Used:** <skills/tools>
**Commit:** none | <hash if instructed>
**Files:** <top files changed>

**Summary:** <1-2 sentences.>

**Feature Tests:**
- Red: `<command>` - PASS/FAIL/NOT APPLICABLE
- Green: `<command>` - PASS/FAIL
- `<command>` - PASS/FAIL

**Other Checks:**
- `<command>` - PASS/FAIL/NOT RUN

**Deviations From Story:**
- <none or explanation>

**Insights For Next Worker:**
- <pattern, gotcha, warning, or decision>
```

## `sprint-completion.md`

```markdown
# Sprint: <name> - Completion Report

**Sprint Type:** implementation | checkpoint
**Branch:** <branch>
**Commit:** <hash or pending>
**Concurrency Used:** <1-4>
**Completed:** <date/time>

## Planned Scope
<From README and stories.>

## Delivered Scope
<What actually changed.>

## Story Results
| Story | Status | Difficulty | Notes |
| --- | --- | --- | --- |
| STORY-001 | completed | hard | <notes> |

## Tests And Checks
| Check | Result | Notes |
| --- | --- | --- |
| <command> | PASS/FAIL | <notes> |

## Quality Review
- spec compliance: PASS/FAIL
- code quality: PASS/FAIL
- security/permissions: PASS/FAIL/N/A
- unrelated files: PASS/FAIL

## Known Issues Or Deferred Work
- <issue or none>

## Verification Handoff
- routes/workflows to verify
- data assumptions
- risky areas
- evidence that Phase 5 should capture if QA is requested
```

## `verification-report.md`

Created by Phase 5 only.

```markdown
# Sprint: <name> - Verification Report

**Verdict:** MERGE | NEEDS WORK | BLOCKED
**Branch:** <branch>
**Commit:** <hash>
**Verified:** <date/time>

## Planned Versus Delivered
<Compare README/stories with sprint-completion.md.>

## Global Checks
| Check | Result | Evidence |
| --- | --- | --- |
| Typecheck | PASS | <summary/log path> |

## Story Results
| Story | Result | Evidence | Notes |
| --- | --- | --- | --- |
| STORY-001 | PASS | <path> | <notes> |

## Browser/API Evidence
- `<path>` - <what it proves>

## Fixes Applied During Verification
- `<file or commit>` - <fix summary>

## Outstanding Issues
- <issue, severity, recommendation>

## Recommendation
<Short rationale.>
```
