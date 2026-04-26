# QA Operating Model

QA is the lead orchestrator for a completed work package. It behaves like a verification operations room: each specialist owns one part of confidence, and the lead synthesizes the result into a final verdict.

## Definition Of Done

Before review starts, define the acceptance target:

- what the work was supposed to deliver
- which user workflows must work
- which data paths must be safe
- which automated tests prove non-browser behavior
- which browser flows must be proven in the Codex in-app browser
- which credentials, seed data, or services are required

If the target cannot be made testable, stop and ask for the missing decision.

## Lanes

| Lane | Owner | Output |
| --- | --- | --- |
| Code review | `qa_code_review` | Defects, risks, missing tests, recommended fixes |
| Tests | `qa_test_runner` | Targeted test results, final gate result, command logs |
| Convex | `qa_convex_reviewer` | Schema, validators, auth, index, public/internal boundary findings |
| Next.js | `qa_next_diagnostics` | Runtime errors, logs, routes, page metadata, hydration/build issues |
| Browser Use | `qa_browser_use` | Real workflow proof, screenshots, console logs, DOM snapshots |
| Computer Use | `qa_computer_use` | Native GUI, system-dialog, extension, simulator, or blocker fallback evidence |
| Fixes | `qa_fixer` | Scoped code/test/doc fixes and retest needs |
| Docs | `qa_docs` | Verification report, checklist updates, handoff notes |
| Proof | `qa_proof_producer` | Narration, manifest, and final proof video only after all required gates pass |

## Loop Control

1. Review and diagnostics identify issues.
2. The lead accepts or rejects each finding.
3. Accepted in-scope issues are assigned to fixer agents.
4. Targeted tests and Browser Use flows are rerun.
5. The loop continues until every acceptance item is accounted for.
6. If any required item remains `FAIL`, `BLOCKED`, or `PARTIAL`, the lead keeps iterating on bounded in-scope fixes until the issue is resolved or a real blocker is proven.
7. When a blocker is proven or user input is needed, the lead stops, writes the report, marks the blocker, records a no-video decision, and does not render the founder video.

Computer Use is not a parallel replacement for Browser Use. It enters only when the workflow is outside the in-app browser surface or Browser Use is unavailable after its supported setup path.

## Verdicts

- `PASS` or `MERGE`: required checks passed, Browser Use evidence exists for user-facing work, runtime diagnostics are clean or explicitly accepted, and no blocking issue remains.
- `NEEDS WORK`: important issues remain and should be fixed before merge.
- `BLOCKED`: the run cannot reach a meaningful verdict because credentials, seed data, services, environment, branch state, or scope decisions are missing.
- `PARTIAL`: some required gates passed, but at least one required gate is unresolved or unproven.

## Proof Video Gate

The proof producer is downstream of QA, not a parallel lane that can mask uncertainty. Assign proof production only when code review, tests, runtime diagnostics, and Browser Use verification are all `PASS` or `MERGE`.

The proof video must include a real recorded browser walkthrough of the verified workflow. Remotion can package that walkthrough with intro/outro, captions, overlays, and narration. Screenshots remain supporting evidence and can appear inside the video, but a screenshot sequence is not an acceptable proof video.

Default target duration is 5-10 minutes for meaningful sprint or feature work. Use a shorter proof only for tiny scoped changes and state the rationale in the report.

## Commit Policy

Commit only after the lead has reviewed the final diff and artifact inventory. Stage specific files only. Keep generated screenshots and videos out of git unless the user asks for an archived proof package.
