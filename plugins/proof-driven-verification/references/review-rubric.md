# Review Rubric

Use this rubric for read-only code-review shards and master-agent synthesis.

## Priorities

1. Correctness and behavioral regressions
2. Security, auth, privacy, and secret handling
3. Data integrity, migrations, and external API contracts
4. Async/concurrency failures, retries, idempotency, and cancellation
5. UX failures, accessibility, layout stability, and loading/error states
6. Test gaps that make the change unsafe to merge
7. Maintainability only when it affects future correctness

## Findings

Each finding should include:

- `file`
- `line`
- `severity`: `critical | high | medium | low`
- `issue`
- `fixRecommendation`
- `confidence`: `0..1`

Keep findings tight. Do not list style preferences unless they create concrete risk.

## Reviewer output schema

```json
{
  "verdict": "pass | needs-fix | blocker",
  "findings": [
    {
      "file": "path",
      "line": 10,
      "severity": "high",
      "issue": "What can break",
      "fixRecommendation": "Specific fix",
      "confidence": 0.82
    }
  ],
  "test_gaps": ["Missing scenario"],
  "browser_scenarios": ["Route and flow to verify"],
  "confidence": 0.8
}
```

## Sharding

- Max 10 changed files per reviewer.
- Max 1,200 diff lines per reviewer.
- Prefer subsystem boundaries over alphabetical splits.
- If one file is very large or risky, assign it alone.

## Stop conditions

Mark `blocker` when:

- the definition of done is missing or untestable
- credentials or data are unavailable
- a destructive migration or production write is required
- CAPTCHA/payment/2FA prevents verification
- reviewer findings conflict and need product direction
