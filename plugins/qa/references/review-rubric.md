# Review Rubric

QA code review is not style review. Findings should describe concrete failure modes that can affect correctness, privacy, security, data integrity, usability, or maintainability.

Prioritize:

- auth, RBAC, tenant isolation, and PHI handling
- public versus internal backend function boundaries
- missing validators and unsafe input trust
- data ownership, provenance, idempotency, and race conditions
- migrations, schema/index changes, and backward compatibility
- user-visible browser state and workflow regressions
- route handlers, webhooks, retries, and external API contracts
- missing tests for changed behavior

Avoid:

- pure formatting preferences
- speculative issues without a plausible failure path
- broad refactors unrelated to the acceptance target

Reviewer output should identify file, line when possible, severity, user or business impact, fix recommendation, and confidence.
