# Codex Review Integration

ProofOps can borrow from Codex review in two ways.

## Local Codex CLI review

If `codex review` is available, use it as an independent read-only reviewer after the master agent has inspected the diff.

Recommended flow:

```bash
codex review --help
codex review
```

Treat its output as advisory. The master agent must verify each finding against the code and include only concrete, reproducible issues in the final review plan.

## GitHub/Codex review behavior

Codex can review PRs through GitHub integrations and automatic review settings. When a PR exists, inspect existing review comments and requested changes through the GitHub plugin/`gh` workflows before duplicating review effort.

## Output Compatibility

Normalize all review sources into the ProofOps reviewer schema:

```json
{
  "verdict": "pass | needs-fix | blocker",
  "findings": [],
  "test_gaps": [],
  "browser_scenarios": [],
  "confidence": 0.8
}
```

## Guardrails

- Do not submit GitHub review comments unless the user explicitly requests it.
- Do not treat automated review findings as proven until checked locally.
- Keep review and implementation separated: reviewers observe; the master agent chooses fixes.
