# Browser Use Proof

Browser Use is the source of truth for Codex-visible browser behavior. The QA plugin uses the Codex in-app browser for web verification. Computer Use is fallback only when Browser Use cannot cover the workflow after its supported setup path, or when the workflow leaves the browser surface. Agent Browser CLI is last fallback only, used when Browser Use and the appropriate Computer Use fallback cannot complete the needed capture or diagnostic path.

## Capability Boundary

Browser Use provides:

- navigation and interaction through the in-app browser
- DOM snapshots
- screenshots as `Image` objects with `toBase64()`
- console logs through `tab.dev.logs(...)`
- visible-state verification through Playwright-style locators and CUA actions

Browser Use evidence is required for browser-facing work, but screenshot evidence is not a proof video. The founder proof video must include a real recorded browser walkthrough of the verified workflow. If the current toolchain cannot produce a real walkthrough recording artifact, QA must mark the video as not produced, explain why in the report, and avoid rendering a screenshot slideshow.

For proof videos, use Browser Use to establish the verified workflow and Playwright recording as the default recorder. The normal script sequence is:

- `create-proof-walkthrough-plan.mjs`
- `record-playwright-proof-walkthrough.mjs`
- `validate-proof-video.mjs`
- `generate-deepgram-narration.mjs`
- `render-remotion-proof-segment.mjs`
- `assemble-proof-video-segments.mjs`
- `run-proof-video-pipeline.mjs`

This creates a real walkthrough segment, renders Remotion intro/outro segments separately, and stitches the pieces with ffmpeg so the recorded walkthrough remains the dominant middle segment. Browser Use frame capture is diagnostic backup only and must not be accepted as founder proof unless the run is explicitly marked internal diagnostic.

## Evidence Capture Shape

Save Browser Use evidence into the active run folder:

```text
<run-dir>/
  verification-report.md
  manifest.json
  screenshots/
    step-001-start.png
    step-002-after-login.png
  logs/
    browser-console.json
    dom-snapshot-001.txt
    nextjs-mcp.json
    test-output-targeted.txt
  recordings/
    browser-walkthrough.webm
    browser-walkthrough/metadata.json
    playwright-recording.json
  narration.txt
  narration-segments.json
  narration-segments/
  narration.mp3
  proof-video/final/qa-proof-video-polished.mp4
```

## In-App Browser Capture Recipe

After Browser Use setup, the browser QA agent should:

1. Name the session.
2. Open or reuse the target tab.
3. Navigate to the local app URL.
4. Capture a screenshot before the workflow starts.
5. Interact with the feature at human-reviewable checkpoints.
6. Capture a screenshot after every meaningful state transition.
7. Save console logs after the flow.
8. Save DOM snapshots only where they help prove state or debug failures.
9. For proof video production, create a walkthrough plan from the verified Browser Use flow, run the Playwright recorder against that plan, then attach the recording and validation metadata in the manifest.

Screenshots can be persisted by converting `Image.toBase64()` to a file from the Node REPL filesystem API.

## Browser Use Fix Loop

For browser-facing work, Browser Use is not a one-time checkbox. It is the loop that proves the fix actually works.

The expected loop is:

1. Run the planned Browser Use flow.
2. Mark each checklist item as `PASS`, `FAIL`, `BLOCKED`, `PARTIAL`, or `N/A`.
3. For each failure, save route, screenshot/log paths, observed behavior, expected behavior, and exact reproduction steps.
4. The QA lead classifies the issue and assigns an accepted bounded fix to a fixer agent.
5. The fixer returns changed files, targeted checks, and Browser Use retest needs.
6. Re-run the affected Browser Use flow.
7. Repeat until the flow passes or the run has a real blocker.

Do not let a code-only fix claim close a browser-visible issue. Browser-visible issues close only after Browser Use retest passes or the report records why retesting is blocked.

## Fallback Order

Use fallback capture only when the normal path cannot prove or record the workflow:

1. Browser Use verification in the Codex in-app browser.
2. Playwright recording for the proof-video walkthrough.
3. Computer Use for native GUI, system dialogs, extensions, simulators, real-profile, desktop, multi-app, or Browser Use blocker scenarios.
4. Agent Browser CLI as the last fallback for capture or diagnostics only after the earlier paths are unavailable or insufficient.

Fallback evidence must be labeled by source in the manifest and report. Agent Browser fallback does not overwrite Browser Use as the QA truth for normal web verification.

## Video Standard

Video production is a final gate. It is forbidden when any required review, test, runtime diagnostic, or Browser Use verification item is `FAIL`, `BLOCKED`, or `PARTIAL`. In those cases, QA continues bounded in-scope fixes and reruns the affected gates. If the issue cannot be resolved after credible attempts or needs user input, QA writes the report, marks the blocker, and does not render a founder video.

The video should tell the founder:

- what the work was supposed to deliver
- what routes and workflows were exercised
- what passed
- what failed and was fixed
- what remains blocked or risky
- final verdict and where to inspect the report

The video is not a replacement for testing. It is the founder-facing proof layer on top of review, tests, runtime diagnostics, and Browser Use evidence.

The middle of the video must be the recorded walkthrough. Remotion may provide intro/outro title cards, captions, overlays, and evidence cards, but those elements wrap the real walkthrough rather than replacing it. Prefer ffmpeg for final stitching of the independently rendered pieces. Default duration is 5-10 minutes for meaningful sprint or feature proof videos. Shorter videos are allowed only for tiny scoped changes, and the report must state why the shorter proof is sufficient.

If intro or outro cards have no narration or meaningful animation, keep them short, normally 2-5 seconds. The walkthrough should receive the majority of the runtime.

Narration should be paced across the walkthrough, not only placed at the beginning. For longer videos, write `narration-segments.json` with chapter labels, start times, and short text blocks. The renderer synthesizes each segment separately because Deepgram Aura accepts 2000 characters per request, then schedules the segment audio over the walkthrough timeline.

Recorder, narration, validation, and render scripts may append artifact paths, logs, validation data, recording status, duration, narration status, and skipped-step reasons. They must never set or mutate `finalVerdict`, `verdict`, required gates, test gates, runtime gates, merge/pass status, or report outcome.
