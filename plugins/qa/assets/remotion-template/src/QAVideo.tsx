import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { proofData } from "./proof-data";

const shortList = (items: readonly unknown[], fallback: string) => {
  const normalized = items.map(String).filter(Boolean).slice(0, 3);
  return normalized.length ? normalized.join(" / ") : fallback;
};

const statusLabel = () => {
  const data = proofData as unknown as { statusLabel?: string; verdict?: string };
  return data.statusLabel || data.verdict || "recorded";
};

const secondsToFrames = (seconds: number, fps: number) => Math.max(1, Math.round(seconds * fps));

const activeChapter = (localSeconds: number) => {
  const chapters = proofData.narrationSegments
    .filter((segment) => segment.chapter)
    .sort((a, b) => a.startSeconds - b.startSeconds);
  let current = "";
  for (const chapter of chapters) {
    if (chapter.startSeconds <= localSeconds + 1) current = chapter.chapter;
  }
  return current;
};

const SupportCards = () => {
  const screenshots = proofData.screenshots.slice(0, 4);
  return (
    <aside className="supportCards">
      <div className="supportCard">
        <span>QA status</span>
        <strong>{statusLabel()}</strong>
      </div>
      <div className="supportCard">
        <span>Routes</span>
        <strong>{shortList(proofData.routesTested, "see report")}</strong>
      </div>
      <div className="supportCard">
        <span>Checks</span>
        <strong>{proofData.checks.length || "see manifest"}</strong>
      </div>
      {screenshots.map((screenshot, index) => (
        <div className="thumbCard" key={screenshot}>
          <Img src={staticFile(screenshot)} />
          <span>Evidence {index + 1}</span>
        </div>
      ))}
    </aside>
  );
};

const Intro = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 24], [18, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill className="intro scene" style={{ opacity, transform: `translateY(${y}px)` }}>
      <section className="introCopy">
        <div className="eyebrow">Founder proof</div>
        <h1>{proofData.title}</h1>
        <p>
          This video opens with the QA evidence summary, then uses the Playwright-recorded browser walkthrough as the primary evidence.
          Screenshots and checks stay on the side as chapter context.
        </p>
        <div className="badges">
          <span>{statusLabel()}</span>
          <span>{Math.round(proofData.walkthroughDurationSeconds)}s walkthrough</span>
          <span>{proofData.proofVideoPolicy.primaryEvidence}</span>
        </div>
      </section>
    </AbsoluteFill>
  );
};

const Walkthrough = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const walkthroughVideo = proofData.walkthroughVideo as string | null;
  const frameIndex = proofData.walkthroughFrames.length
    ? Math.min(
        proofData.walkthroughFrames.length - 1,
        Math.floor((frame / fps) * proofData.walkthroughFrameFps),
      )
    : 0;
  const walkthroughFrame = proofData.walkthroughFrames[frameIndex] || null;
  const localSeconds = frame / fps;
  const chapter = activeChapter(localSeconds);

  return (
    <AbsoluteFill className="walkthrough scene">
      <div className="walkthroughCanvas">
        <div className="videoShell">
          <div className="chrome">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <p>{walkthroughVideo ? "Recorded Playwright walkthrough" : "Recorded frame walkthrough"}</p>
          </div>
          <div className="videoStage">
            {walkthroughVideo ? (
              <OffthreadVideo
                src={staticFile(walkthroughVideo)}
                className="walkthroughVideo"
                muted={proofData.hasAudio}
              />
            ) : walkthroughFrame ? (
              <Img src={staticFile(walkthroughFrame)} className="walkthroughVideo" />
            ) : (
              <div className="empty">
                <strong>No walkthrough video</strong>
                <span>The renderer only allows this in explicit report-only smoke mode.</span>
              </div>
            )}
          </div>
        </div>
        {chapter ? <div className="chapterOverlay">{chapter}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const hasBlockers = proofData.blockers.length > 0;
  return (
    <AbsoluteFill className="outro scene" style={{ opacity }}>
      <section className="outroCopy">
        <div className="eyebrow">Closeout</div>
        <h1>QA status: {statusLabel()}</h1>
        <p>
          {hasBlockers
            ? `Open blockers: ${shortList(proofData.blockers, "see report")}.`
            : proofData.reportSummary || "The report and manifest contain the detailed evidence trail."}
        </p>
        <div className="badges">
          <span>{shortList(proofData.commandsRun, "commands in report")}</span>
          <span>{proofData.screenshots.length} supporting screenshots</span>
        </div>
      </section>
    </AbsoluteFill>
  );
};

export const QAVideo = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const introFrames = secondsToFrames(proofData.timing.introSeconds, fps);
  const walkthroughFrames = secondsToFrames(proofData.timing.walkthroughSeconds, fps);
  const outroStart = introFrames + walkthroughFrames;
  const outroFrames = Math.max(1, durationInFrames - outroStart);

  return (
    <AbsoluteFill className="root">
      {proofData.hasAudio ? <Audio src={staticFile("assets/narration.mp3")} /> : null}
      {proofData.narrationSegments.filter((segment) => segment.file).map((segment, index) => (
        <Sequence
          key={`${segment.file}-${index}`}
          from={introFrames + secondsToFrames(segment.startSeconds, fps)}
          premountFor={12}
        >
          <Audio src={staticFile(segment.file)} />
        </Sequence>
      ))}
      <div className="grid" />
      <header>
        <div className="mark">QA</div>
        <strong>Codex QA Proof</strong>
        <span>Playwright walkthrough + supporting evidence</span>
      </header>
      <Sequence from={0} durationInFrames={introFrames} premountFor={24}>
        <Intro />
      </Sequence>
      <Sequence from={introFrames} durationInFrames={walkthroughFrames} premountFor={24}>
        <Walkthrough />
      </Sequence>
      <Sequence from={outroStart} durationInFrames={outroFrames} premountFor={24}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
