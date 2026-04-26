---
name: qa
description: Use when the user asks Codex to verify completed work, review code, run tests, debug Next.js or Convex behavior, use Browser Use for real browser QA, fix issues, update documentation, create narrated proof videos, commit changes, or verify one or more completed sprint folders.
---

# QA

Run end-to-end QA as a small verification team. The goal is not to inspect code and guess. The goal is to prove that completed work behaves correctly, repair bounded failures, document what happened, and leave the founder with a report. A proof video is produced only as the final founder-facing artifact after every required gate is `PASS` or `MERGE`.

## Required Reading

Read only the references needed for the run:

1. `../../references/browser-use-proof.md`
2. `../../references/qa-operating-model.md`
3. `../../references/evidence-contract.md`
4. `../../references/review-rubric.md`
5. `../../references/stack-profiles.md`
6. `../../references/tool-selection.md`
7. `../../references/companion-plugins.md`
8. `../../references/codex-review-and-github.md`

If the work involves Next.js, initialize Next.js DevTools MCP and follow its documentation requirements before using Next.js runtime diagnostics. If the work involves Convex, load the available Convex rules skill before reviewing Convex changes.

## Invocation Modes

### Completed Work

Use when the user asks to verify the current branch, diff, PR, feature, or task. Build the definition of done from the user request, changed files, project docs, and tests.

### Sprint Folder Queue

Use when the user provides one or more sprint folders. Process the folders in order. For each sprint, read:

1. `README.md`
2. all `stories/STORY-*.md`
3. `progress.md`
4. `sprint-completion.md`
5. `verification-checklist.md`
6. existing `verification-report.md`, if present

Do not move to the next sprint until the current sprint has a verdict, report, evidence manifest, video/no-video decision, and commit/no-change decision.

## Golden Rules

1. Browser-facing behavior should be verified with Browser Use in the Codex in-app browser when that runtime is available.
2. Use Agent Browser CLI as the deterministic proof-video browser and as a structured browser automation fallback when Browser Use cannot provide durable recording.
3. Use Computer Use only as a fallback for native GUI, system-dialog, extension, simulator, or browser-runtime blocker scenarios.
4. Do not claim user-visible behavior passed from code review alone.
5. Use subagents for the actual work when available: code review, tests, Convex review, Next.js diagnostics, Browser Use QA, Computer Use fallback, fixer, documentation, and proof producer.
6. Route verification subagents to the strongest available model with high reasoning effort for production, clinical, security, cross-system, or high-ambiguity work.
7. Preserve unrelated user changes. Never stage or commit files outside the accepted QA scope.
8. Treat real PHI, real credentials, and production data as out of scope for proof videos unless the user explicitly approves a safe handling plan.
9. Every checklist item or definition-of-done item must end as `PASS`, `FAIL`, `BLOCKED`, `PARTIAL`, or `N/A` with evidence and rationale.
10. Proof video production is a final gate only. Do not render a founder video until code review, tests, runtime diagnostics, and browser verification are all `PASS`, `MERGE`, or explicitly `N/A` for a proof-pipeline-only run.
11. If any required gate is `FAIL`, `BLOCKED`, or `PARTIAL`, keep iterating on bounded in-scope fixes and rerun the affected gates. If credible attempts cannot resolve the issue or user input is required, stop, write the report, mark the blocker, and do not render the founder video.
12. A proof video must be a real walkthrough recording artifact. Screenshots are supporting evidence only; do not create a screenshot slideshow and call it proof.
13. Remotion may create the intro, outro, captions, overlays, and final assembly, but the middle of the video must be an actual recorded browser walkthrough of the verified workflow.
14. Default proof-video duration is 5-10 minutes for meaningful sprint or feature verification. Use a shorter video only for a tiny scoped change, and state in the report why a shorter duration is enough.
15. Do not record exploratory debugging. Finish QA first, then record a clean deterministic demo with a fresh Agent Browser session/profile.
16. Every Agent Browser recording run must use one unique session and one unique profile path. Run `agent-browser close --all` once at the beginning only, then keep that same session/profile alive through auth, local state setup, recording, and validation. Load CLI-served skill docs, run `doctor --json`, validate with `ffprobe`, and sample frames.

## Workflow

1. **Intake and scope**
   - Read the user request, repo instructions, branch, status, diff, sprint artifacts when supplied, and available scripts.
   - Define what must be true for the work to be accepted.
   - Create a task list before launching verification lanes.

2. **Set up evidence**
   - Create a QA run with `node plugins/qa/scripts/create-qa-run.mjs`.
   - Use `sprints/<name>/evidence/<run-id>/` for sprint verification when a sprint folder is provided.
   - Use `artifacts/qa/<run-id>/` for branch, PR, or generic feature verification.

3. **Launch verification lanes**
   - `qa_code_review`: read-only diff and acceptance review.
   - `qa_test_runner`: targeted tests, then final gate when ready.
   - `qa_convex_reviewer`: Convex schema/function/auth/index review when Convex changed.
   - `qa_next_diagnostics`: Next.js DevTools MCP, logs, routes, page metadata, errors.
   - `qa_browser_use`: Browser Use workflow verification and evidence capture.
   - `qa_computer_use`: fallback for native GUI or Browser Use blockers when explicitly needed.
   - `qa_fixer`: bounded fixes accepted by the lead.
   - `qa_docs`: verification report, docs updates, checklist status.
   - `qa_proof_producer`: narration and proof video rendering.

4. **Review and browser QA**
   - Run code review and test lanes first so obvious defects are found early.
   - Start the app using project-approved commands.
   - Use Next.js DevTools MCP for runtime truth when available.
   - Use Browser Use to exercise every user-visible flow.
   - Capture screenshots, console logs, DOM snapshots where useful, and route notes into the QA run folder.

5. **Fix loop**
   - Classify each issue as sprint-caused/current-work-caused, pre-existing, environment, missing credential, or new-scope.
   - Fix bounded in-scope failures immediately.
   - Re-run the affected tests and Browser Use flow after every fix.
   - Continue until the definition of done is satisfied or a blocker is proven.
   - Do not advance to proof-video production while any required item remains `FAIL`, `BLOCKED`, or `PARTIAL`.

6. **Final gates**
   - Run targeted checks after fixes.
   - Run the project’s final gate before `MERGE` or `PASS` verdicts, unless the project docs define a lighter accepted gate.
   - For ZScribeV2, default final gate is `bun run check`; use targeted Bun tests while iterating.
   - Confirm code review, automated tests, runtime diagnostics, and Browser Use verification are all `PASS` or `MERGE` before assigning proof production.

7. **Report, video, and commit**
   - Write `verification-report.md`.
   - Write or update `manifest.json`.
   - Validate artifacts with `node plugins/qa/scripts/validate-qa-artifacts.mjs <run-dir>`.
   - If and only if the final verdict is `PASS` or `MERGE`, record the final walkthrough with `node plugins/qa/scripts/record-agent-browser-walkthrough.mjs <run-dir> --url=<app-url> --plan=<plan.json>`, then render the proof video with `node plugins/qa/scripts/render-qa-video.mjs <run-dir>`.
   - If the final verdict is `FAIL`, `BLOCKED`, or `PARTIAL`, record the no-video decision in the report and manifest and stop after the report/artifact validation step.
   - Commit only scoped product fixes, tests, docs, and lightweight QA artifacts. Do not commit bulky videos/screenshots unless the user explicitly wants the proof archive in git.

## Browser Use Evidence Pattern

Browser Use is the primary Codex in-app surface for driving web verification when available. It supplies the interaction trail, screenshots, DOM snapshots, console logs, and visible-state checks that prove what happened. Agent Browser is the durable recording surface for proof videos and may also be used as a structured browser automation fallback when Browser Use cannot represent the required auth/session/recording behavior. Computer Use is fallback only for native GUI, system dialogs, extensions, simulators, or browser-runtime blockers after the supported browser setup path has been attempted.

The Browser Use QA subagent must save:

- `screenshots/step-###-<label>.png`
- `logs/browser-console.json`
- `logs/dom-snapshot-###.txt` when useful
- `logs/nextjs-mcp.json` when available
- `logs/test-output-*.txt`
- `manifest.json`

## Proof Video Contract

The proof video is a founder walkthrough, not the verification itself. It is allowed only after the QA lead has a `PASS` or `MERGE` verdict across review, automated tests, runtime diagnostics, and Browser Use verification.

The middle of the proof video must be an actual recorded browser walkthrough of the verified workflow. Screenshots may appear as supporting callouts, evidence cards, or report inserts, but they must not replace the walkthrough recording. If no real walkthrough recording artifact can be produced, the run must ship the report with a no-video decision instead of rendering a screenshot slideshow.

Record only a final clean demo, never the exploratory QA loop. The proof producer must use a unique Agent Browser session and profile, close stale daemons once at the beginning of the run, avoid `--auto-connect` unless deliberately importing auth state, avoid shared profiles, avoid unmanaged tabs, and validate raw WebM duration plus sampled frames before Remotion packaging. Start recording from the current authenticated page instead of passing a new URL to `record start` after login.

Remotion may generate intro/outro segments, title cards, captions, overlays, and final assembly around the recorded walkthrough. For meaningful sprint or feature verification, target 5-10 minutes. For a tiny scoped change, a shorter video is acceptable only when the report explains why the shorter duration still proves the work.

## Deepgram Narration

The proof producer uses `DEEPGRAM_API_KEY` first, then the QA plugin’s macOS Keychain helper. Configure once with:

`node plugins/qa/scripts/deepgram-key.mjs set`

The script reads from `DEEPGRAM_API_KEY` or stdin. Never write the key into a repo file.

## Final Response

Report in founder-facing terms:

- what was verified
- what changed or was fixed
- the logic behind the verification result
- what the founder can now inspect
- tradeoffs or blockers
- report path, video path if produced, and commit hash if committed
