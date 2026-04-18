# Evidence Contract

All proof-driven verification runs write to:

```text
artifacts/verification/<timestamp>/
```

## Required structure

```text
verification-report.md
manifest.json
screenshots/
videos/
logs/
```

Required files before final response:

- `verification-report.md`
- `manifest.json`
- at least one screenshot under `screenshots/`
- at least one WebM under `videos/` for browser-facing verification
- `logs/browser-console.txt`
- `logs/browser-errors.txt`
- `logs/network-requests.txt`

Optional final proof:

- `proof-video.mp4`
- `narration.txt`
- `narration.mp3`

## Manifest fields

`manifest.json` must include:

- `taskSummary`
- `gitBase`
- `gitHead`
- `changedFileCount`
- `reviewerShardCount`
- `commandsRun`
- `routesTested`
- `artifacts`
- `finalVerdict`
- `blockers`
- `commitHash`

Use `null` for `commitHash` when no commit was created.

## Report sections

`verification-report.md` must include these headings:

- `Definition of done`
- `Review findings`
- `Browser verification`
- `Fixes made`
- `Commands and tests`
- `Evidence links`
- `Residual risks`
- `Commit details`

## Validation rules

- Never claim an artifact exists until it exists and has non-zero size.
- Validate video/audio with `ffprobe` when available.
- Empty browser error logs are valid if the file exists.
- If no MP4 is generated, state why: missing `DEEPGRAM_API_KEY`, missing Remotion dependencies, user disabled narration, or blocker occurred earlier.
- Do not commit bulky generated media by default.
