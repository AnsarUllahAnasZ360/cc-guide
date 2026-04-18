---
name: code-review-swarm
description: Run a structured code-review swarm for a PR, branch, or diff. Use when proof-driven verification needs read-only review shards, especially when subagents are explicitly authorized or the diff exceeds 10 files or 1,200 diff lines.
---

# Code Review Swarm

This skill defines the review protocol used by `verify-pr-proof`.

## Sharding

- Max 10 changed files per reviewer.
- Max 1,200 diff lines per reviewer.
- Prefer subsystem shards: app UI, API routes, database/types, tests, agents/jobs, packages.
- Assign high-risk large files alone.
- If subagents are not authorized, apply the same shard model serially.

## Reviewer Instructions

Each reviewer is read-only. They must inspect the assigned diff and nearby code, then return:

```json
{
  "verdict": "pass | needs-fix | blocker",
  "findings": [
    {
      "file": "path",
      "line": 10,
      "severity": "critical | high | medium | low",
      "issue": "Concrete failure mode",
      "fixRecommendation": "Specific fix",
      "confidence": 0.8
    }
  ],
  "test_gaps": ["Missing test or scenario"],
  "browser_scenarios": ["Route/flow to verify"],
  "confidence": 0.8
}
```

## Review Rubric

Read `../../references/review-rubric.md`.
Read `../../references/codex-review.md` if `codex review`, GitHub PR review comments, or automated Codex review output is available.

Prioritize:

- correctness and regressions
- auth/security/privacy
- data integrity and migrations
- external API contracts
- async/retry/idempotency/cancellation
- user-facing browser behavior
- missing tests that affect merge safety

Do not report pure style opinions.

## Synthesis

The master agent must:

- deduplicate findings
- reject speculative findings with weak evidence
- turn accepted findings into a fix plan
- map browser scenarios into Agent Browser flows
- preserve unresolved blockers in the final report

## External Review Sources

- `codex review` may be used as one advisory reviewer if available.
- Existing GitHub review comments must be inspected before duplicating review work.
- Normalize all review sources into the reviewer output schema.
- The master agent must verify external findings locally before accepting them.
