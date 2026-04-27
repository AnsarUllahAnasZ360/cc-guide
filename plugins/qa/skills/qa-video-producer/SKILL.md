---
name: qa-video-producer
description: Use after QA has already passed to produce founder-facing proof videos with a Browser Use-verified workflow, a Playwright-recorded walkthrough, Remotion intro/outro, and Deepgram narration. Never use for partial, failed, or blocked QA runs.
---

# QA Video Producer

Produce the final founder proof video for a completed QA run. This skill is downstream of `$qa`; it does not decide that work passed, substitute for QA, or create confidence from incomplete evidence.

## Required Inputs

Before doing substantive video work, read:

1. `../../references/evidence-contract.md`
2. `../../references/browser-use-proof.md`
3. `../../references/tool-selection.md`
4. `../../references/qa-operating-model.md`

Then inspect the QA run folder and confirm:

- `verification-report.md` exists.
- `manifest.json` exists.
- final verdict is `PASS` or `MERGE`.
- code review, tests, runtime diagnostics, and Browser Use verification are all `PASS` or `MERGE`.
- Browser Use evidence exists for browser-facing work.
- a real recorded browser walkthrough artifact exists or can be produced for the verified workflow, normally through Playwright recording.

If any item is missing, `FAIL`, `BLOCKED`, or `PARTIAL`, stop. Update the report/manifest with a no-video decision if needed, name the blocker, and do not render the founder video.

## Video Contract

The proof video must be a real walkthrough artifact:

- The middle is an actual recorded browser walkthrough of the verified workflow.
- Browser Use remains primary for driving the web verification and workflow evidence.
- Playwright recording is the default proof-video recorder.
- Computer Use is fallback only for native GUI, system dialogs, extensions, simulators, real-profile, desktop, multi-app, or Browser Use blockers after the supported Browser Use setup path has been attempted.
- Agent Browser CLI is last fallback only after Browser Use and Computer Use cannot complete the needed capture or diagnostic path. Label any Agent Browser evidence as fallback evidence and explain why it was necessary.
- Screenshots are supporting evidence only. Do not assemble a screenshot slideshow and call it a proof video.
- Remotion may create the intro, outro, title cards, captions, overlays, and transitions. The preferred final assembly is ffmpeg stitching of standalone Remotion bookends plus the full-screen Playwright walkthrough.
- Deepgram narration may be generated from `DEEPGRAM_API_KEY` or the QA keychain helper.
- Do not include PHI, secrets, credentials, production data, or unsafe screen content in narration, screenshots, recordings, reports, or manifests.
- Video and recorder scripts may append artifact paths, logs, validation metadata, duration, recording status, narration status, and skipped-step reasons. They must never set or mutate `finalVerdict`, `verdict`, required gates, test gates, runtime gates, merge/pass status, or report outcome.

## Duration

Default to 5-10 minutes for meaningful sprint or feature proof videos. Use a shorter video only for a tiny scoped change, and state in the report why the shorter walkthrough is enough.

## Workflow

1. Read the report and manifest.
2. Verify every required gate is `PASS` or `MERGE`.
3. Confirm the walkthrough recording covers the verified workflow, not an unrelated happy path.
4. Create or refresh the walkthrough plan with `create-proof-walkthrough-plan.mjs`.
5. Record the walkthrough with `record-playwright-proof-walkthrough.mjs` unless the run documents an approved fallback.
6. Validate the source recording and final video metadata with `validate-proof-video.mjs`.
7. Write or update `narration.txt` from the verified report.
8. Generate narration audio with `generate-deepgram-narration.mjs` when Deepgram is available.
9. Render standalone bookend segments with `render-remotion-proof-segment.mjs`.
10. Assemble intro, full-screen walkthrough, narration, and optional outro with `assemble-proof-video-segments.mjs`.
11. Use `run-proof-video-pipeline.mjs` when the project provides the end-to-end wrapper.
12. Validate that the final MP4 exists, has non-zero size, keeps the full walkthrough segment, and is backed by the walkthrough recording.
13. Update the report and manifest with the video path, duration, source recording path, validation data, recording status, and any skipped narration reason.

## Output

Return the report path, manifest path, source walkthrough recording path, video path, duration, narration status, validation status, and any reason video was not produced.
