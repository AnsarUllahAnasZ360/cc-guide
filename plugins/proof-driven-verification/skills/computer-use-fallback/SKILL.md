---
name: computer-use-fallback
description: Use Computer Use as a fallback when proof-driven verification cannot be completed with structured browser automation. Applies to native desktop apps, browser extensions, existing logged-in browser profiles, iOS simulators, file pickers, desktop GUI-only flows, or bugs that only reproduce in a real GUI.
---

# Computer Use Fallback

Use this only after structured tools are insufficient.

## Prefer Before Computer Use

1. Static inspection and tests.
2. Framework runtime tools such as Next.js DevTools MCP.
3. Agent Browser for deterministic browser automation and artifacts.
4. Codex in-app browser for human visual comments.

## Use Computer Use For

- Native macOS or desktop app workflows.
- Browser extension verification.
- Existing browser profiles or logged-in sessions that cannot be exported as storage state.
- iOS simulator or device workflows.
- OS file pickers, downloads, clipboard, or app-switching behavior.
- Visual bugs that only reproduce in a real GUI window.

## Evidence Rules

- Still save screenshots, logs, and notes under `artifacts/verification/<timestamp>/`.
- State clearly which steps used Computer Use and why Agent Browser was insufficient.
- Do not let GUI state become the only proof; capture durable files whenever possible.
- Avoid unrelated apps and personal data. If sensitive information appears, redact report text and avoid narration uploads.
