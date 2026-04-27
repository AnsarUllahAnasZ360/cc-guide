# Tool Selection

Use the best source of truth for each job. QA should coordinate tools rather than duplicate them.

## Browser Verification

Use Browser Use first for all user-visible web verification in Codex.

- Use the Codex in-app browser.
- Capture screenshots at meaningful workflow checkpoints.
- Capture console logs through Browser Use when useful.
- Capture DOM snapshots when they prove state or explain a failure.
- Do not use Agent Browser CLI for normal QA.

Screenshots, logs, and DOM snapshots are supporting evidence. They are not a proof video by themselves. If a founder proof video is produced, it must include a real recorded browser walkthrough of the workflow that Browser Use verified.

## Computer Use

Use Computer Use only as a fallback or expansion surface:

- native macOS apps
- browser extensions
- system dialogs and permissions prompts
- iOS simulator or desktop GUI workflows
- existing logged-in profiles that Browser Use cannot represent
- multi-app workflows that must cross outside the browser
- cases where Browser Use is unavailable after the supported setup path is attempted

Computer Use evidence should be treated as separate from Browser Use evidence and clearly labeled in the report.

## Agent Browser CLI

Agent Browser CLI is the last fallback, not the normal web QA surface.

Use it only when:

- Browser Use cannot complete the needed browser verification or capture after its supported setup path.
- Computer Use is unavailable, inappropriate, or insufficient for the blocker.
- The user has asked for a fallback artifact and the run can clearly label the evidence source.

Agent Browser fallback evidence must not be used to quietly upgrade a blocked Browser Use run into a normal pass. The report must explain why the fallback was used and what confidence tradeoff remains.

## Next.js

For Next.js apps, use Next.js DevTools MCP before final browser verdicts when available.

- discover running app context
- inspect runtime errors
- inspect route and page metadata
- inspect logs
- connect runtime errors back to the Browser Use flow that exposed them

## Convex

Use Convex CLI and Convex rules for schema, function, validator, index, auth, environment, and deployment checks. Do not infer backend safety from UI success alone.

## GitHub

Use the GitHub plugin or `gh` when the QA target has PR or CI context.

- inspect existing PR review comments before duplicating review work
- inspect failing GitHub Actions when CI is part of the acceptance gate
- use publish workflows only when the user wants a branch pushed or PR opened

## Video Proof

Raw evidence comes first. The proof video is the founder-facing synthesis layer after review, tests, diagnostics, and browser verification have produced `PASS` or `MERGE` evidence.

Do not render video for `FAIL`, `BLOCKED`, or `PARTIAL` runs. Continue bounded in-scope fixes and rerun the affected gates. If the run cannot be made clean after credible attempts or needs user input, write the report, mark the blocker, and skip video production.

Use Playwright recording as the default recorder, then Remotion for intro/outro, captions, overlays, and ffmpeg for final assembly. The middle must be an actual recorded browser walkthrough, not a screenshot slideshow. Default duration is 5-10 minutes for meaningful sprint or feature proof; shorter videos are allowed only for tiny scoped changes with an explicit rationale in the report.

The planned video scripts are:

- `setup-qa-video-pipeline.mjs`
- `create-proof-walkthrough-plan.mjs`
- `record-playwright-proof-walkthrough.mjs`
- `validate-proof-video.mjs`
- `generate-deepgram-narration.mjs`
- `render-remotion-proof-segment.mjs`
- `assemble-proof-video-segments.mjs`
- `run-proof-video-pipeline.mjs`

`render-remotion-proof-video.mjs`, when present, is legacy/report-style packaging only. The preferred production path is segmented: Remotion bookends, full-screen Playwright walkthrough, Deepgram narration, ffmpeg stitching, final validation.

These scripts may write artifact metadata and validation details, but they must not set or mutate final verdicts, required gates, test gates, runtime gates, merge/pass status, or report outcome.
