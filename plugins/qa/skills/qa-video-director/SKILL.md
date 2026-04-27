---
name: qa-video-director
description: Use after QA has passed to plan and produce polished founder-facing proof videos as separate intro, deliberate walkthrough, and optional closeout segments with synchronized narration, visible cursor/clicks, validation, and ffmpeg stitching.
---

# QA Video Director

Use this skill only after QA has already passed or the user explicitly asks for a proof-video demo with the QA boundary documented. This skill does not decide QA verdicts, upgrade gates, or substitute recording for verification.

## Operating Principle

Treat the proof video like a board-ready product walkthrough, not a recording artifact. The video should explain what was verified, show the actual product behavior at a human pace, and make the evidence easy to trust.

The proof video has three independent pieces:

1. Intro segment: a short Remotion-rendered card, normally 2-5 seconds when silent, 5-30 seconds when it includes meaningful narration or evidence, up to 60 seconds only for complex work.
2. Walkthrough segment: the actual recorded browser or desktop workflow, full-screen and paced for narration.
3. Closeout segment: optional Remotion-rendered conclusion, normally 0-5 seconds when silent, 10-20 seconds only when it adds real explanation.

The final MP4 is stitched after the segments are independently rendered and validated. Use ffmpeg for final stitching so the Remotion intro/outro cannot accidentally hide or resize the walkthrough.

## Required Inputs

Read before producing video:

- QA report and manifest.
- Code review/test/runtime evidence.
- Browser Use evidence for web workflows.
- Existing proof-video plan, if present.
- Product or sprint completion report.

Stop before video if required QA gates are not passing, unless the user explicitly asked for a demo-only video. In demo-only mode, write `finalVerdict: null` or preserve the existing verdict and state clearly that video generation does not change QA outcome.

## Planning Contract

Before recording, write a plan artifact under `proof-video/plans/` that includes:

- Audience and business purpose.
- Intro script and expected duration.
- Walkthrough chapters.
- Routes/pages shown.
- User actions demonstrated.
- Assertions checked.
- Cursor/click/callout moments.
- Narration script by chapter.
- Expected duration by chapter.
- Closeout script or decision to omit closeout.
- Tool path: Playwright default, Computer Use fallback, Agent Browser last fallback.

Do not improvise during recording. If the plan is wrong, update the plan first.

For most proof videos, spend the time budget on the walkthrough. Silent title cards should be brief. The founder should not wait through long static bookends.

## Walkthrough Recording

Default recorder: deterministic Playwright context video.

For Playwright recordings:

- Use one browser context and one page unless the app requires a popup.
- Use fixed viewport, normally 1440x900.
- Use robust selectors and visible assertions before/after important actions.
- Pace actions deliberately. The viewer should understand what changed before the next action starts.
- Use the recorder's visible in-page cursor/click/callout overlay, because Playwright viewport video does not guarantee native OS cursor visibility.
- Move the cursor before clicking.
- Show click ripples.
- Use short callouts for chapter transitions or key evidence.
- Record full-screen product behavior, not evidence cards as the main content.
- Do not record terminal output as a substitute for app verification.
- If a step fails, stop and mark recording failed.

Use Computer Use or ScreenCaptureKit only when Playwright cannot cover the workflow: native app flows, real browser profiles, extensions, system dialogs, auth flows that require an existing user session, desktop/multi-app workflows, or when true OS cursor capture is required. Agent Browser CLI remains last fallback only.

## Narration Sync

Avoid the failure mode where audio talks about one thing while the video shows another.

Preferred process:

1. Plan chapters and target durations.
2. Record the walkthrough at the planned pace.
3. Use the execution log and screenshots to write the narration from what actually happened.
4. Generate Deepgram narration by chapter.
5. Measure audio durations with ffprobe.
6. If narration is longer than the video chapter, either add planned pauses/freeze frames and rerender, or re-record that chapter slower.
7. If narration is shorter, keep the full walkthrough and pad with silence when needed. Do not chop the walkthrough just because the audio ended first.

Do not use a single generic narration paragraph over a fast UI tour. Narration must map to visible chapters.

## Assembly

Render intro and closeout with Remotion as standalone MP4 segments. They may include:

- Title.
- Verified scope.
- Evidence sources.
- Final QA boundary.
- Short founder-facing explanation.

The walkthrough segment should remain the main recorded product video. Use ffmpeg to:

- normalize all segments to the same resolution, frame rate, codec, and audio format;
- add the chapter narration to the walkthrough;
- concatenate intro, walkthrough, and closeout;
- preserve audio sync.

Validate the final stitched MP4 after assembly.

## Validation

A successful proof video requires:

- raw recording exists and is non-trivial;
- raw duration matches the plan or the report explains the difference;
- raw recording has nonblank first/middle/last frames;
- execution log completed all planned steps;
- final URL/state matches the plan;
- final MP4 exists and is non-trivial;
- final MP4 has audio when narration was requested;
- extracted final frames show the walkthrough as the dominant middle segment, not a tiny picture-in-picture or hidden strip;
- intro/walkthrough/outro timing does not chop narration or video;
- generated artifacts do not mutate QA verdicts or gates.

If the final video looks wrong, fix the segment or plan and rerender. Do not call it done because the file exists.

## Output

Return:

- plan path;
- intro segment path;
- walkthrough raw path;
- walkthrough-with-audio path;
- closeout segment path or omitted reason;
- final stitched video path;
- validation paths;
- known limitations;
- what is safe to commit;
- what is ignored;
- what still needs founder approval.
