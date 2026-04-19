# Sprint Artifact Templates

## state.md

```markdown
# Sprint: <name> - State

**Phase:** 1 research | 2 stories | 3 review | 4 execution | 5 verification
**Status:** active | paused | blocked | complete
**Branch:** sprint/<name>
**Base:** main
**Updated:** <date/time>

## Current Objective
<What the lead is doing now.>

## Decisions
- <Decision and why.>

## Active Agents
| Agent | Role | Assignment | Status |
| --- | --- | --- | --- |
| research_auth | explorer | Auth flow research | running |

## Queue
- [ ] STORY-001 - <title>
- [ ] STORY-002 - <title>

## Blockers
- <blocker, owner, next step>

## Resume Instructions
1. Read this file.
2. Read README.md if present.
3. Read progress.md if present.
4. Run `node plugins/sprint-protocol/scripts/sprint-doctor.mjs <name>`.
5. Continue from the first unchecked queue item.
```

## research.md

```markdown
# Sprint: <name> - Research

## Overview
<What was investigated and why.>

## Findings

### <Area>
**Current state:** <summary>

**Evidence:**
- `path/to/file.ts:line` - <finding>

**Patterns:** <local conventions>
**Gaps:** <missing pieces>
**Risks:** <risk and mitigation>
**Story implications:** <what story writers need to know>

## Cross-Cutting Concerns
- <auth, permissions, styling, data, tests, performance>

## Open Questions
- <question or none>
```

## plan.md

```markdown
# Sprint: <name> - Plan

## Goal
<1-2 sentences.>

## Scope

### In
- <included>

### Out
- <excluded>

## Proposed Stories
| ID | Title | Brief | Tier | Research Items |
| --- | --- | --- | --- | --- |
| STORY-001 | <title> | <brief> | complex | <files/areas> |

## Story Count Justification
<Why this count is right and why stories should not be merged/split further.>

## Order And Dependencies
- STORY-001 first because <reason>.

## Verification Strategy
- <global checks>
- <browser/API flows>
- <data requirements>

## Risks
- <risk and mitigation>
```

## README.md

```markdown
# Sprint: <name>

## Goal
<single most important outcome>

## Scope

### In Scope
- <item>

### Out Of Scope
- <item>

## Stories
| ID | Title | Tier | Status | Dependencies |
| --- | --- | --- | --- | --- |
| STORY-001 | <title> | complex | pending | none |

## Success Criteria
1. <measurable outcome>
2. Typecheck, lint, tests, and build pass or documented blockers exist.
3. Verification checklist completed with evidence.
```

## verification-checklist.md

```markdown
# Sprint: <name> - Verification Checklist

## Global Checks
- [ ] `<typecheck command>` - expected: zero errors
- [ ] `<lint command>` - expected: zero errors
- [ ] `<test command>` - expected: all tests pass
- [ ] `<build command>` - expected: build succeeds

## Per-Story Checks

### STORY-001: <title>
- [ ] <acceptance criterion> - verify by <command/browser/API flow>
- [ ] <acceptance criterion> - evidence: screenshot/recording/log

## Integration Checks
- [ ] <cross-story behavior>

## Environment
- <services, credentials, seed data, local URL>
```

## progress.md

```markdown
# Sprint: <name> - Progress

> Append-only worker ledger. Every worker reads all entries before editing.

---

## STORY-001 - <title>
**Status:** completed | partial | blocked
**Agent:** worker_story_001
**Commit:** <hash>
**Files:** <top files changed>

**Summary:** <1-2 sentences.>

**Checks:**
- <command> - PASS/FAIL

**Insights For Next Worker:**
- <pattern, gotcha, warning, or decision>
```

## sprint-completion.md

```markdown
# Sprint: <name> - Completion

## Results
| Story | Status | Commit | Notes |
| --- | --- | --- | --- |
| STORY-001 | completed | <hash> | <notes> |

## Final Checks
- Typecheck: PASS/FAIL
- Lint: PASS/FAIL
- Tests: PASS/FAIL
- Build: PASS/FAIL

## Deferred Or Known Issues
- <issue or none>

## Verification Handoff
- <routes, flows, data, risky areas>
```

## verification-report.md

```markdown
# Sprint: <name> - Verification Report

**Verdict:** MERGE | NEEDS WORK | BLOCKED
**Branch:** sprint/<name>
**Verified:** <date/time>

## Global Checks
| Check | Result | Evidence |
| --- | --- | --- |
| Typecheck | PASS | <summary/log path> |

## Story Results
| Story | Result | Evidence | Notes |
| --- | --- | --- | --- |
| STORY-001 | PASS | <path> | <notes> |

## Fixes Applied
- `<commit>` - <fix summary>

## Evidence
- `<path>` - <what it proves>

## Outstanding Issues
- <issue, severity, recommendation>

## Recommendation
<Short rationale.>
```
