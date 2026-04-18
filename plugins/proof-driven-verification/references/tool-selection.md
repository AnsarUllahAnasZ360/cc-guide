# Tool Selection

Use this order unless the user or local repo instructions say otherwise.

## Runtime truth

- For Next.js 16+ apps, call Next.js DevTools MCP before browser proof.
- Use `nextjs_index` to discover the running server.
- Use `get_errors`, `get_routes`, `get_page_metadata`, and `get_logs` for diagnostics.
- If HTTPS or cert handling blocks MCP discovery, retry on the app's HTTP/unsafe dev command if the repo provides one.

## Browser proof

- Use `agent-browser` for durable evidence: screenshots, WebM, console logs, page errors, network requests, and snapshots.
- Use fresh snapshots after navigation, form submission, modal open/close, or dynamic content changes.
- Start recording with `agent-browser record start <path> <url>` when possible. Some versions create too-short videos when recording starts before navigation.
- Validate videos with `ffprobe` before mentioning them.

## Codex in-app browser

- Use for human visual comments and quick local frontend review.
- Do not treat it as the source of durable artifacts unless the app exposes explicit files.

## Computer Use

Use only when structured browser automation cannot cover the workflow:

- native macOS apps
- iOS simulator or desktop GUI state
- browser extensions
- existing logged-in user profile that cannot be represented as storage state
- GUI-only bugs

## GitHub plugin workflows

- Use GitHub plugin skills for PR context, review comments, CI logs, and publish flow.
- Use `gh-address-comments` for unresolved inline review threads.
- Use `gh-fix-ci` for GitHub Actions failures.
- Use `yeet` only when explicitly publishing or creating a PR.

## Proof video

- Raw evidence is mandatory for every loop.
- Narrated Remotion MP4 is final proof only, or blocker proof when the run cannot pass.
- Deepgram uses `DEEPGRAM_API_KEY` first, then the secure local store from `deepgram-key.mjs`.
- If absent, produce silent/raw proof and report the missing key.
