# QA Evidence Contract

The QA lead must not claim evidence exists until files exist and validation passes.

## Required Files

Every QA run must contain:

- `verification-report.md`
- `manifest.json`
- `screenshots/` with at least one `.png`, `.jpg`, or `.jpeg`
- `logs/`

Recommended logs:

- `logs/browser-console.json`
- `logs/nextjs-mcp.json`
- `logs/computer-use.json`
- `logs/github-context.json`
- `logs/test-output-*.txt`
- `logs/git-status.txt`

Optional final proof:

- `proof-video/plans/proof-walkthrough.plan.json`
- `proof-video/raw/browser-walkthrough.webm`
- `proof-video/logs/playwright-proof-walkthrough.json`
- `proof-video/validation/raw/validation.json`
- `proof-video/audio/narration.mp3`
- `proof-video/audio/narration.vtt`
- `proof-video/remotion/intro.mp4`
- `proof-video/remotion/outro.mp4`
- `proof-video/final/qa-proof-video-polished.mp4`
- `proof-video/final/assembly-metadata.json`
- `proof-video/validation/final/validation.json`
- `narration.txt`

Final proof artifacts are optional because they are allowed only after a clean QA pass. A QA run with any `FAIL`, `BLOCKED`, or `PARTIAL` required gate must still produce the report and manifest, but must not produce a final proof-video MP4.

## Manifest Fields

`manifest.json` must include:

- `taskSummary`
- `runId`
- `createdAt`
- `cwd`
- `gitBranch`
- `gitHead`
- `mode`
- `sprintFolder`
- `commandsRun`
- `routesTested`
- `checks`
- `artifacts`
- `finalVerdict`
- `blockers`
- `commitHash`
- `videoDecision`
- `videoDecisionReason`

Use `null` when a field is not applicable.

## Outcome Ownership

The QA lead owns verdicts and gates. Artifact producers, recorders, narration scripts, validation scripts, and render scripts may append:

- artifact paths
- log paths
- validation metadata
- source recording path
- recording status
- duration
- narration status
- skipped-step reasons

They must never set or mutate:

- `finalVerdict`
- `verdict`
- required gate status
- test gate status
- runtime gate status
- merge status
- pass status
- report outcome

This keeps the proof-video pipeline in its proper role: it can prove that artifacts exist and are usable, but it cannot decide that the product work passed QA.

## Report Sections

`verification-report.md` must include:

- `Definition of done`
- `Review findings`
- `Automated tests`
- `Runtime diagnostics`
- `Browser Use verification`
- `Computer Use fallback`, when used
- `GitHub and CI context`, when used
- `Fixes made`
- `Documentation updates`
- `Evidence inventory`
- `Video decision`
- `Residual risks`
- `Verdict`

## Validation

Run:

`node plugins/qa/scripts/validate-qa-artifacts.mjs <run-dir>`

For video-specific validation, also run:

`node plugins/qa/scripts/validate-proof-video.mjs <run-dir> --kind raw`

and, after Remotion rendering:

`node plugins/qa/scripts/validate-proof-video.mjs <run-dir> --kind final`

If validation fails, fix the artifacts or report the run as blocked/partial. Do not claim a proof video exists unless the final MP4 exists and has non-zero size, the final verdict is `PASS` or `MERGE`, and the source evidence includes a real recorded browser walkthrough.

Do not render or validate a founder proof video for a partial pass. If a required gate remains unresolved after credible bounded fixes, set the final verdict to `FAIL`, `BLOCKED`, or `PARTIAL`, record the blocker, and set `videoDecision` to a no-video outcome with a clear reason.

For segmented proof videos, validate in this order:

1. Validate the raw Playwright recording.
2. Render Remotion intro/outro segments.
3. Assemble the final video with ffmpeg.
4. Validate the final MP4.
5. Inspect sampled final frames when possible to confirm the walkthrough is full-screen and dominant.

The final video duration must not be shortened just because narration audio is shorter than the walkthrough. The walkthrough is the evidence segment and must be preserved.

## Artifact Hygiene

Keep run artifacts contained under the active run directory, normally `artifacts/qa/<run-id>/`, `sprints/<name>/evidence/<run-id>/`, or the setup/proof-video workspace under `qa-artifacts/`.

Do not commit bulky or sensitive generated artifacts unless the user explicitly asks for an archived proof package:

- raw recordings
- rendered videos
- screenshots
- narration audio
- temporary frame dumps
- browser profiles
- secrets, credentials, tokens, PHI, or production data
- generated cache directories

Commit lightweight reports, manifests, checklists, and documentation only when they are intentionally part of the project history. If a project does not already ignore generated QA media, add or request an ignore rule before the artifacts spread outside the run directory.
