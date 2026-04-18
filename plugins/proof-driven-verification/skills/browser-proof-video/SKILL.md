---
name: browser-proof-video
description: Capture browser proof artifacts and render final verification videos. Use when proof-driven verification needs Agent Browser screenshots/WebM/logs, artifact validation, Deepgram narration, or Remotion MP4 output.
---

# Browser Proof Video

Use this skill for durable evidence. Agent Browser is the artifact engine; Remotion and Deepgram are final-report polish.

For exploratory QA methodology, load `../browser-dogfood/SKILL.md`.

## Raw Browser Evidence

Create:

```text
artifacts/verification/<timestamp>/
  screenshots/
  videos/
  logs/
```

Recommended Agent Browser sequence:

```bash
agent-browser --session proof close --all || true
agent-browser --session proof record start artifacts/verification/<ts>/videos/flow.webm http://localhost:3000/path
agent-browser --session proof wait --load networkidle
agent-browser --session proof snapshot -i > artifacts/verification/<ts>/logs/snapshot.txt
agent-browser --session proof screenshot artifacts/verification/<ts>/screenshots/step.png --full
agent-browser --session proof console > artifacts/verification/<ts>/logs/browser-console.txt
agent-browser --session proof errors > artifacts/verification/<ts>/logs/browser-errors.txt
agent-browser --session proof network requests > artifacts/verification/<ts>/logs/network-requests.txt
agent-browser --session proof record stop
```

Use fresh snapshots after navigation or DOM changes.

## Validation

Run:

```bash
node plugins/proof-driven-verification/scripts/validate-artifacts.mjs artifacts/verification/<ts>
```

Never mention proof artifacts before validation passes.

## Narration

- Write `narration.txt` from the verification report.
- Use `DEEPGRAM_API_KEY` from the environment.
- If no env var is set, scripts check the local secure store configured by `deepgram-key.mjs`.
- Default model: `aura-2-odysseus-en`.
- If the key is missing, skip TTS and produce raw/silent proof.

## Final MP4

Run:

```bash
node plugins/proof-driven-verification/scripts/render-proof-video.mjs artifacts/verification/<ts>
```

The script uses `assets/remotion-template/`, copies proof assets into a temporary Remotion project, generates audio when possible, renders `proof-video.mp4`, and validates the result with `ffprobe`.

Do not commit generated videos/screenshots unless the user explicitly asks.
