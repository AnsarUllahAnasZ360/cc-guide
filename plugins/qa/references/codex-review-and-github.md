# Codex Review And GitHub

QA can use Codex review, GitHub PR context, and local review lanes as independent inputs. None of those inputs is automatically authoritative.

## Review Inputs

- local diff review by QA code-review agents
- `codex review` output when available
- existing GitHub PR comments or requested changes
- GitHub Actions failure logs when CI is in scope

## Normalization

Every review source should be reduced to:

- finding
- affected surface
- severity
- evidence
- reproduction path when possible
- proposed fix or reason not to fix
- status: accepted, rejected, duplicate, pre-existing, blocked, or fixed

## Guardrails

- Do not submit GitHub comments unless the user asks for that.
- Do not trust automated review output until the QA lead verifies it against the code.
- Review agents should not edit code. The QA lead assigns accepted fixes to the fixer lane.
- Existing PR comments must be checked before QA creates duplicate findings.
