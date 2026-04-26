---
name: qa-video-producer
description: Use after QA has already passed to produce founder-facing proof videos with an Agent Browser recorded walkthrough, Remotion intro/outro, and Deepgram narration. Never use for partial, failed, or blocked QA runs.
---

# QA Video Producer

Produce the final founder proof video for a completed QA run. This skill is downstream of `$qa`; it does not decide that work passed, substitute for QA, or create confidence from incomplete evidence.

## Required Inputs

Before doing substantive video work, read:

1. `../../references/evidence-contract.md`
2. `../../references/browser-use-proof.md`
3. `../../references/tool-selection.md`
4. `../../references/qa-operating-model.md`

Then inspect the QA run folder and confirm:

- `verification-report.md` exists.
- `manifest.json` exists.
- final verdict is `PASS` or `MERGE`.
- code review, tests, runtime diagnostics, and Browser Use verification are all `PASS` or `MERGE`.
- browser evidence exists for browser-facing work.
- a real Agent Browser recorded walkthrough artifact exists or can be produced for the verified workflow.

If any item is missing, `FAIL`, `BLOCKED`, or `PARTIAL`, stop. Update the report/manifest with a no-video decision if needed, name the blocker, and do not render the founder video.

## Video Contract

The proof video must be a real walkthrough artifact:

- The middle is an actual recorded browser walkthrough of the verified workflow.
- Browser Use remains preferred for Codex-visible web verification when available.
- Agent Browser is the required native WebM recorder for deterministic final walkthrough videos unless a validated fallback recorder is explicitly documented.
- Computer Use is fallback only for native GUI, system dialogs, extensions, simulators, or Browser Use blockers after the supported Browser Use setup path has been attempted.
- Screenshots are supporting evidence only. Do not assemble a screenshot slideshow and call it a proof video.
- Remotion may create the intro, outro, title cards, captions, overlays, transitions, and final MP4 assembly.
- Deepgram narration may be generated from `DEEPGRAM_API_KEY` or the QA keychain helper.
- Do not include PHI, secrets, credentials, production data, or unsafe screen content in narration, screenshots, recordings, reports, or manifests.

## Duration

Default to 5-10 minutes for meaningful sprint or feature proof videos. Use a shorter video only for a tiny scoped change, and state in the report why the shorter walkthrough is enough.

## Workflow

1. Read the report and manifest.
2. Verify every required gate is `PASS` or `MERGE`.
3. Confirm the walkthrough recording covers the verified workflow, not an unrelated happy path.
4. Write or update `narration.txt` from the verified report.
5. Generate narration audio when Deepgram is available.
6. Use Remotion only for packaging: intro, walkthrough middle, overlays, captions, outro, and final assembly.
7. Validate that `qa-proof-video.mp4` exists, has non-zero size, and is backed by the walkthrough recording.
8. Update the report and manifest with the video path, duration, source recording path, and any skipped narration reason.

Before recording a new walkthrough, run `agent-browser close --all`, create a unique session and profile, run `agent-browser doctor --json`, save `agent-browser skills get core --full`, record only the final deterministic demo, then validate with `ffprobe` and sampled frames.

## Output

Return the report path, manifest path, source walkthrough recording path, video path, duration, narration status, validation status, and any reason video was not produced.
