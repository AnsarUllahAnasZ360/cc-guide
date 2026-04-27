# QA Operating Model

QA is the lead orchestrator for a completed work package. It behaves like a verification operations room: each specialist owns one part of confidence, and the lead synthesizes the result into a final verdict.

## Modes

QA has five reusable modes:

- `planning`: understand the task, sprint, sprint queue, branch, PR, or feature before execution. This mode produces a written QA plan, verification checklist, task list, agent ownership map, and expected evidence plan. It does not decide the final verdict.
- `setup`: prepare or repair the local QA and proof-video pipeline. This checks companion capabilities, local commands, artifact directories, ignored outputs, and video prerequisites. It does not decide whether product work passed.
- `qa`: verify completed work against a definition of done using review, tests, runtime diagnostics, Browser Use, bounded fixes, and a final report.
- `proof-video`: produce a founder-facing proof video only after the QA mode has already reached `PASS` or `MERGE`.
- `explain`: explain a run, artifact set, tool decision, blocker, or plugin behavior without changing verdicts or mutating evidence.

## Planning Output

Planning is the control layer for the whole run. The QA lead should not jump directly into tests or browser work unless the task is trivial.

The planning artifact should include:

- scope: single feature, sprint, sprint queue, branch, PR, or hotfix;
- source material: sprint README, story files, completion report, verification checklist, diff, product docs, and repo instructions;
- definition of done: user-visible behavior, data behavior, security/privacy requirements, performance expectations, documentation requirements, and accepted test gates;
- workflow map: pages, routes, APIs, background jobs, native/desktop surfaces, integrations, and required credentials;
- risk map: auth, tenant isolation, PHI, secrets, payment, external APIs, data migration, browser compatibility, and regressions;
- subagent plan: which lanes will run, what each owns, what skills each must invoke, and what each must return;
- Browser Use plan: exact flows that must be exercised in the Codex in-app browser, screenshots/logs to save, and retest rules;
- fix-loop plan: how findings become accepted fixes, how retests happen, and when the loop stops;
- proof-video eligibility: what gates must pass before the video director is allowed to start;
- final reporting plan: manifest, verification report, checklist, subagent summary, video/no-video decision, commit/PR handoff.

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
| Planning | `qa_planner` or lead | QA plan, definition of done, task list, agent ownership map |
| Code review | `qa_code_review` | Defects, risks, missing tests, recommended fixes |
| Tests | `qa_test_runner` | Targeted test results, final gate result, command logs |
| Convex | `qa_convex_reviewer` | Schema, validators, auth, index, public/internal boundary findings |
| Next.js | `qa_next_diagnostics` | Runtime errors, logs, routes, page metadata, hydration/build issues |
| Browser Use | `qa_browser_use` | Real workflow proof, screenshots, console logs, DOM snapshots |
| Computer Use | `qa_computer_use` | Native GUI, system-dialog, extension, simulator, or blocker fallback evidence |
| Fixes | `qa_fixer` | Scoped code/test/doc fixes and retest needs |
| Docs | `qa_docs` | Verification report, checklist updates, handoff notes |
| Video direction | `qa_video_director` | Proof-video plan, chapters, pacing, narration plan, segment strategy |
| Proof | `qa_proof_producer` | Remotion bookends, narration, ffmpeg assembly, manifest, and final proof video only after all required gates pass |

## Subagent Operating Model

The master QA agent is the lead. It does not try to be every specialist at once.

The lead owns:

- reading the user request and project instructions;
- producing the initial plan and task list;
- deciding which subagents to launch;
- accepting or rejecting findings;
- classifying failures as in-scope, pre-existing, environment, credential, or new scope;
- assigning bounded fixes;
- deciding when gates are clean enough for proof-video mode;
- writing the final founder-facing synthesis.

Subagents own execution:

- reviewers inspect code and risks but do not edit;
- test runners run commands and summarize failures;
- Browser Use agents operate the in-app browser and save visible evidence;
- Computer Use agents cover fallback desktop/native workflows only when assigned;
- fixer agents implement accepted bounded fixes and name retest needs;
- documentation agents update reports and checklists;
- video agents produce video artifacts only after the lead authorizes proof-video mode.

Each subagent prompt should be self-contained and should name:

- scope and files/surfaces owned;
- skills to invoke before working;
- artifacts to read;
- artifacts to produce;
- commands or browser flows to run;
- whether editing is allowed;
- how to classify failures;
- what must be retested before the lane can pass.

## Loop Control

1. Review and diagnostics identify issues.
2. The lead accepts or rejects each finding.
3. Accepted in-scope issues are assigned to fixer agents.
4. Fixer agents return changed files, checks run, and Browser Use retest needs.
5. Targeted tests and Browser Use flows are rerun.
6. The lead updates the loop ledger: finding, owner, fix, targeted test, Browser Use retest, current status.
7. The loop continues until every acceptance item is accounted for.
8. If any required item remains `FAIL`, `BLOCKED`, or `PARTIAL`, the lead keeps iterating on bounded in-scope fixes until the issue is resolved or a real blocker is proven.
9. When a blocker is proven or user input is needed, the lead stops, writes the report, marks the blocker, records a no-video decision, and does not render the founder video.

Computer Use is not a parallel replacement for Browser Use. It enters only when the workflow is outside the in-app browser surface or Browser Use is unavailable after its supported setup path. Agent Browser CLI is the last fallback when Browser Use and the appropriate Computer Use fallback cannot complete the needed capture or diagnostic path.

Browser Use is the most important runtime loop for web products. Code review and tests can say that the implementation looks plausible; Browser Use proves what the founder and user would actually see. A run cannot pass a browser-facing feature unless the Browser Use lane either passes or the report clearly documents why the flow could not be exercised and marks the run blocked or partial.

## Verdicts

- `PASS` or `MERGE`: required checks passed, Browser Use evidence exists for user-facing work, runtime diagnostics are clean or explicitly accepted, and no blocking issue remains.
- `NEEDS WORK`: important issues remain and should be fixed before merge.
- `BLOCKED`: the run cannot reach a meaningful verdict because credentials, seed data, services, environment, branch state, or scope decisions are missing.
- `PARTIAL`: some required gates passed, but at least one required gate is unresolved or unproven.

## Proof Video Gate

The video director and proof producer are downstream of QA, not parallel lanes that can mask uncertainty. Assign proof production only when code review, tests, runtime diagnostics, and Browser Use verification are all `PASS` or `MERGE`.

The proof video must include a real recorded browser walkthrough of the verified workflow. Playwright recording is the default proof recorder. Remotion should render standalone intro/outro bookends. ffmpeg should stitch the bookends, full-screen walkthrough, narration, and optional closeout. Screenshots remain supporting evidence and can appear inside the video, but a screenshot sequence is not an acceptable proof video.

If the intro or outro has no narration or meaningful editing, keep it short, normally 2-5 seconds. Use longer Remotion bookends only when they add real explanation, evidence, or transition value.

Default target duration is 5-10 minutes for meaningful sprint or feature work. Use a shorter proof only for tiny scoped changes and state the rationale in the report.

Recorder, narration, validation, and render scripts can update artifact inventory, validation data, recording status, duration, and narration metadata. They cannot set or mutate final verdicts, required gates, test gates, runtime gates, merge/pass status, or report outcome.

## Commit Policy

Commit only after the lead has reviewed the final diff and artifact inventory. Stage specific files only. Keep generated screenshots, raw recordings, rendered videos, narration audio, temporary frame dumps, browser profiles, secrets, credentials, PHI, production data, and generated caches out of git unless the user asks for an archived proof package. If generated QA media appears outside the run directory, move it back under the run directory or add/request a project ignore rule before committing.
