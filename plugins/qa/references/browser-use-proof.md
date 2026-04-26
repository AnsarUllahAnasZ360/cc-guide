# Browser Use Proof

Browser Use is the source of truth for Codex-visible browser behavior when the runtime is available. Agent Browser is the deterministic proof-video recorder and may be used as a structured browser automation fallback when Browser Use cannot provide durable auth/session/recording behavior. Computer Use is fallback only when browser automation cannot cover the workflow after the supported setup path, or when the workflow leaves the browser surface.

## Capability Boundary

Browser Use provides:

- navigation and interaction through the in-app browser
- DOM snapshots
- screenshots as `Image` objects with `toBase64()`
- console logs through `tab.dev.logs(...)`
- visible-state verification through Playwright-style locators and CUA actions

Browser Use evidence is required for browser-facing work, but screenshot evidence is not a proof video. The founder proof video must include a real recorded browser walkthrough of the verified workflow. If the current toolchain cannot produce a real walkthrough recording artifact, QA must mark the video as not produced, explain why in the report, and avoid rendering a screenshot slideshow.

For founder proof videos, do not record the exploratory QA loop. After browser verification passes, record a clean deterministic walkthrough with Agent Browser native WebM using one unique session and one unique profile path. Remotion can then wrap that raw WebM with intro, outro, overlays, and narration. Browser Use screenshots and frame capture are diagnostic backup only and must not be accepted as founder proof unless the run is explicitly marked internal diagnostic.

macOS screen recording is not a primary proof source because it can capture the wrong window or terminal surface. Use it only as an explicitly labeled diagnostic fallback.

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
    browser-walkthrough.mov
    browser-walkthrough/metadata.json
  narration.txt
  narration-segments.json
  narration-segments/
  narration.mp3
  qa-proof-video.mp4
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
9. For proof video production, start the macOS screen recorder, perform the Browser Use walkthrough in the visible in-app browser, then stop the recorder and attach the `.mov` file in the manifest.

Screenshots can be persisted by converting `Image.toBase64()` to a file from the Node REPL filesystem API.

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

The middle of the video must be the recorded walkthrough. Remotion may provide an intro, outro, title cards, captions, overlays, and final assembly, but those elements wrap the real walkthrough rather than replacing it. Default duration is 5-10 minutes for meaningful sprint or feature proof videos. Shorter videos are allowed only for tiny scoped changes, and the report must state why the shorter proof is sufficient.

Narration should be paced across the walkthrough, not only placed at the beginning. For longer videos, write `narration-segments.json` with chapter labels, start times, and short text blocks. The renderer synthesizes each segment separately because Deepgram Aura accepts 2000 characters per request, then schedules the segment audio over the walkthrough timeline.
