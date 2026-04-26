# Tool Selection

Use the best source of truth for each job. QA should coordinate tools rather than duplicate them.

## Browser Verification

Use Browser Use first for user-visible web verification in Codex when the Browser Use runtime is available and can represent the target workflow.

- Use the Codex in-app browser.
- Capture screenshots at meaningful workflow checkpoints.
- Capture console logs through Browser Use when useful.
- Capture DOM snapshots when they prove state or explain a failure.
- Use Agent Browser CLI for deterministic final proof-video recording and as a structured fallback when Browser Use cannot provide durable auth/session/recording behavior.

Screenshots, logs, and DOM snapshots are supporting evidence. They are not a proof video by themselves. If a founder proof video is produced, it must include a real recorded browser walkthrough of the workflow that Browser Use verified.

## Computer Use

Use Computer Use only as a fallback or expansion surface:

- native macOS apps
- browser extensions
- system dialogs and permissions prompts
- iOS simulator or desktop GUI workflows
- existing logged-in profiles that Browser Use cannot represent
- cases where Browser Use is unavailable after the supported setup path is attempted

Computer Use evidence should be treated as separate from browser automation evidence and clearly labeled in the report.

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

Use Agent Browser native WebM recording for the final deterministic walkthrough unless a validated fallback recorder is required. Do not record exploratory debugging. Use one unique `--session`, one unique `--profile`, and `agent-browser close --all` once at the beginning only. Keep that same session/profile alive through auth, local state setup, recording, and validation. Start recording from the current authenticated page. Run `doctor --json`, save CLI-served skill docs, validate with `ffprobe`, and sample frames. Use Remotion for intro/outro, captions, overlays, and final assembly. The middle must be an actual recorded browser walkthrough, not a screenshot slideshow. Default duration is 5-10 minutes for meaningful sprint or feature proof; shorter videos are allowed only for tiny scoped changes with an explicit rationale in the report.
