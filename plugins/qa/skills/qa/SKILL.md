---
name: qa
description: Use when the user asks Codex to set up the QA plugin pipeline, verify completed work, review code, run tests, debug Next.js or Convex behavior, use Browser Use for real browser QA, fix issues, update documentation, create narrated proof videos, explain QA/plugin behavior, commit changes, or verify one or more completed sprint folders.
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

### Planning

Use when the user asks QA to inspect a task, sprint, multiple sprint folders, branch, PR, feature, or completed work package and produce the execution blueprint before verification starts. Planning mode reads the available sprint reports, README files, completion reports, changed files, branch status, acceptance criteria, and project instructions. It produces a detailed plan and task list, but does not assign a final QA verdict and does not produce a proof video.

### Setup

Use when the user asks to install, doctor, prepare, or repair the QA pipeline. Confirm companion capabilities, expected local commands, artifact directories, video prerequisites, and ignored generated outputs. For video setup, use `setup-qa-video-pipeline.mjs` when the project provides it. Setup mode checks Node/npm/pnpm/bun, Playwright module/CLI/browsers, ffmpeg/ffprobe, Remotion template dependencies, Deepgram key handling, artifact directories, Browser Use/Computer Use availability expectations, and an optional segmented smoke video. Setup mode does not assign product QA verdicts.

### QA

Use when the user asks to verify a branch, diff, PR, feature, completed task, or sprint. Build the definition of done from the user request, changed files, project docs, and tests. Browser Use is the source of truth for browser-facing verification.

### Proof Video

Use only after QA has already passed or merged. The default proof-video path is: create a walkthrough plan, record a real browser walkthrough with Playwright recording, validate the recording, generate narration when available, render Remotion intro/outro segments, assemble the final MP4 with ffmpeg, then validate the final artifact. Use these script names when present:

- `create-proof-walkthrough-plan.mjs`
- `record-playwright-proof-walkthrough.mjs`
- `validate-proof-video.mjs`
- `generate-deepgram-narration.mjs`
- `render-remotion-proof-segment.mjs`
- `assemble-proof-video-segments.mjs`
- `run-proof-video-pipeline.mjs`

`render-remotion-proof-video.mjs` is legacy/report-style packaging only. Prefer the segmented path where Remotion renders intro/outro and ffmpeg stitches the full-screen Playwright walkthrough between them.

Proof-video mode can append artifact paths, logs, validation metadata, recording status, duration, and narration status. It must never set or mutate the QA verdict, final verdict, required gates, test gates, runtime gates, merge status, pass status, or report outcome.

### Explain

Use when the user asks how QA works, what the plugin will do, which tools it uses, what artifacts mean, or why a run passed, failed, skipped video, or used a fallback. Explain mode reads local docs and run artifacts, but does not change verdicts or run destructive actions.

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

1. Start with planning. Every non-trivial QA run must produce a plan and task list before verification lanes begin.
2. The lead agent orchestrates, synthesizes, assigns, and decides. Specialist subagents do broad execution: planning support, code review, tests, runtime diagnostics, Browser Use QA, Computer Use fallback, fixes, documentation, and proof production.
3. Assign each subagent a clear owner lane, input set, deliverable, and validation requirement. Do not launch vague agents.
4. Browser-facing behavior must be verified with Browser Use in the Codex in-app browser.
5. Browser Use is the QA truth for web verification. A video recording is proof packaging, not a substitute for Browser Use evidence.
6. Browser Use verification is the central loop: verify, classify failures, assign fixes, rerun targeted tests, rerun Browser Use, and repeat until the definition of done is satisfied or a real blocker is proven.
7. Use Playwright recording as the default proof-video recorder.
8. Use Computer Use only as a fallback for native GUI, system-dialog, extension, simulator, real browser profile, desktop, multi-app, or Browser Use blocker scenarios.
9. Use Agent Browser CLI only as the last fallback after Browser Use and Computer Use cannot complete the needed capture or diagnostic path. Label it as fallback evidence and explain the reduced confidence or blocker that forced it.
10. Do not claim user-visible behavior passed from code review alone.
11. Review agents must invoke the relevant local skills for the surface being reviewed: Next.js rules for Next.js, Convex rules for Convex, frontend/design/shadcn/impeccable guidance for UI, and security/privacy review for auth, tenant isolation, PHI, credentials, and data access.
12. Preserve unrelated user changes. Never stage or commit files outside the accepted QA scope.
13. Treat real PHI, real credentials, and production data as out of scope for proof videos unless the user explicitly approves a safe handling plan.
14. Every checklist item or definition-of-done item must end as `PASS`, `FAIL`, `BLOCKED`, `PARTIAL`, or `N/A` with evidence and rationale.
15. Proof video production is a final gate only. Do not render a founder video until code review, tests, runtime diagnostics, and Browser Use verification are all `PASS` or `MERGE`.
16. If any required gate is `FAIL`, `BLOCKED`, or `PARTIAL`, keep iterating on bounded in-scope fixes and rerun the affected gates. If credible attempts cannot resolve the issue or user input is required, stop, write the report, mark the blocker, and do not render the founder video.
17. A proof video must be a real walkthrough recording artifact. Screenshots are supporting evidence only; do not create a screenshot slideshow and call it proof.
18. Remotion should create short bookend segments, captions, overlays, and evidence cards. The middle of the video must be an actual recorded browser walkthrough of the verified workflow, stitched with ffmpeg after raw validation passes.
19. If intro or outro segments have no narration or meaningful motion, keep them short, normally 2-5 seconds. Use longer bookends only when they carry real explanation, narration, or evidence.
20. Default proof-video duration is 5-10 minutes for meaningful sprint or feature verification. Use a shorter video only for a tiny scoped change, and state in the report why a shorter duration is enough.
21. Recorder and video scripts may append artifact paths, logs, validation data, recording status, duration, and narration status. They must never set or mutate `finalVerdict`, `verdict`, required gates, test gates, runtime gates, merge/pass status, or report outcome.

## Workflow

1. **Intake and scope**
   - Read the user request, repo instructions, branch, status, diff, sprint artifacts when supplied, and available scripts.
   - Define what must be true for the work to be accepted.
   - Create a written QA plan and task list before launching verification lanes.
   - For multiple sprint folders, produce one plan per sprint plus one queue-level dependency and risk summary.

2. **Set up evidence**
   - Create a QA run with `node plugins/qa/scripts/create-qa-run.mjs`.
   - Use `sprints/<name>/evidence/<run-id>/` for sprint verification when a sprint folder is provided.
   - Use `artifacts/qa/<run-id>/` for branch, PR, or generic feature verification.
   - Keep bulky generated screenshots, recordings, narration audio, and final videos in the run directory and out of git unless the user explicitly asks for an archived proof package.

3. **Launch verification lanes**
   - `qa_planner`: plan refinement, acceptance criteria, task list, agent ownership map.
   - `qa_code_review`: read-only diff and acceptance review.
   - `qa_test_runner`: targeted tests, then final gate when ready.
   - `qa_convex_reviewer`: Convex schema/function/auth/index review when Convex changed.
   - `qa_next_diagnostics`: Next.js DevTools MCP, logs, routes, page metadata, errors.
   - `qa_browser_use`: Browser Use workflow verification and evidence capture.
   - `qa_computer_use`: fallback for native GUI or Browser Use blockers when explicitly needed.
   - `qa_fixer`: bounded fixes accepted by the lead.
   - `qa_docs`: verification report, docs updates, checklist status.
   - `qa_video_director`: proof-video plan, script, segment timing, and validation checklist after QA passes.
   - `qa_proof_producer`: narration, Remotion bookends, ffmpeg assembly, validation, and artifact report.

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
   - Keep a visible loop ledger: issue, owner, fix, targeted check, Browser Use retest result, current status.
   - Continue until the definition of done is satisfied or a blocker is proven.
   - Do not advance to proof-video production while any required item remains `FAIL`, `BLOCKED`, or `PARTIAL`.

6. **Final gates**
   - Run targeted checks after fixes.
   - Run the project’s final gate before `MERGE` or `PASS` verdicts, unless the project docs define a lighter accepted gate.
   - Prefer the target repository's documented final gate from its README, AGENTS instructions, package scripts, CI config, or sprint checklist.
   - Confirm code review, automated tests, runtime diagnostics, and Browser Use verification are all `PASS` or `MERGE` before assigning proof production.

7. **Report, video, and commit**
   - Write `verification-report.md`.
   - Write or update `manifest.json`.
   - Validate artifacts with `node plugins/qa/scripts/validate-qa-artifacts.mjs <run-dir>`.
   - If and only if the final verdict is `PASS` or `MERGE`, produce the proof video with the project-provided video pipeline scripts, normally `node plugins/qa/scripts/run-proof-video-pipeline.mjs <run-dir>`.
   - If the final verdict is `FAIL`, `BLOCKED`, or `PARTIAL`, record the no-video decision in the report and manifest and stop after the report/artifact validation step.
   - Report how many subagents ran, what each owned, what they found, what was fixed, what was rechecked, and why the final verdict is justified.
   - Commit only scoped product fixes, tests, docs, and lightweight QA artifacts. Do not commit bulky videos, screenshots, raw recordings, narration audio, secrets, credential material, or generated cache folders unless the user explicitly wants the proof archive in git.

## Browser Use Evidence Pattern

Browser Use is the primary surface for driving web verification. It supplies the interaction trail, screenshots, DOM snapshots, console logs, and visible-state checks that prove what happened. Computer Use is fallback only for native GUI, system dialogs, extensions, simulators, real-profile, desktop, multi-app, or Browser Use blocker scenarios after the supported Browser Use setup path has been attempted. Agent Browser CLI is a last fallback only when both the normal Browser Use path and the appropriate Computer Use fallback cannot complete the needed capture or diagnostic path.

The Browser Use QA subagent must save:

- `screenshots/step-###-<label>.png`
- `logs/browser-console.json`
- `logs/dom-snapshot-###.txt` when useful
- `logs/nextjs-mcp.json` when available
- `logs/test-output-*.txt`
- `manifest.json`

## Proof Video Contract

The proof video is a founder walkthrough, not the verification itself. It is allowed only after the QA lead has a `PASS` or `MERGE` verdict across review, automated tests, runtime diagnostics, and Browser Use verification.

The default recorder is Playwright via `record-playwright-proof-walkthrough.mjs`, driven by a walkthrough plan from `create-proof-walkthrough-plan.mjs`. The middle of the proof video must be an actual recorded browser walkthrough of the verified workflow. Screenshots may appear as supporting callouts, evidence cards, or report inserts, but they must not replace the walkthrough recording. If no real walkthrough recording artifact can be produced, the run must ship the report with a no-video decision instead of rendering a screenshot slideshow.

Remotion should generate standalone intro/outro segments, title cards, captions, and overlays. The final MP4 should normally be assembled by `assemble-proof-video-segments.mjs`, which uses ffmpeg to stitch intro, the full-screen Playwright walkthrough, narration, and optional outro. `validate-proof-video.mjs` validates video existence, duration, recording linkage, and metadata only; it does not decide whether QA passed. For meaningful sprint or feature verification, target 5-10 minutes. For a tiny scoped change, a shorter video is acceptable only when the report explains why the shorter duration still proves the work.

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
