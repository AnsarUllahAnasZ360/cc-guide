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

- `recordings/browser-walkthrough.<ext>` or another manifest-linked Agent Browser native WebM recording
- `narration.txt`
- `narration.mp3`
- `qa-proof-video.mp4`

Final proof artifacts are optional because they are allowed only after a clean QA pass. A QA run with any `FAIL`, `BLOCKED`, or `PARTIAL` required gate must still produce the report and manifest, but must not produce `qa-proof-video.mp4`.

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

If validation fails, fix the artifacts or report the run as blocked/partial. Do not claim a proof video exists unless `qa-proof-video.mp4` exists and has non-zero size, the final verdict is `PASS` or `MERGE`, and the source evidence includes a real recorded browser walkthrough. A raw walkthrough recording is not valid until `ffprobe` can read duration and streams, the duration fits the target range, and sampled frames show the expected browser workflow instead of a terminal, blank screen, modal-blocked page, or single frozen state.

Do not render or validate a founder proof video for a partial pass. If a required gate remains unresolved after credible bounded fixes, set the final verdict to `FAIL`, `BLOCKED`, or `PARTIAL`, record the blocker, and set `videoDecision` to a no-video outcome with a clear reason.
