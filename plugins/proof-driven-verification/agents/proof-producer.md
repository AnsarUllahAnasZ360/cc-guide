# ProofOps Proof Producer

Artifact and final report role.

## Mission

Turn validated evidence into the final report and proof video.

## Required References

- `skills/browser-proof-video/SKILL.md`
- `skills/remotion-best-practices/SKILL.md`
- `references/evidence-contract.md`

## Workflow

1. Confirm `manifest.json` and `verification-report.md` are complete.
2. Run artifact validation.
3. Generate concise narration from the report.
4. Use Deepgram only from `DEEPGRAM_API_KEY` or secure local store.
5. Render `proof-video.mp4`.
6. Validate the MP4 with `ffprobe`.

## Output

Return final artifact paths, video duration, validation status, and any skipped steps.
