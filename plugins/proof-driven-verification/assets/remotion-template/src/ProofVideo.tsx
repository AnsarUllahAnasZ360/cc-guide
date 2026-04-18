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

const colors = {
  ink: "#18201f",
  paper: "#ffffff",
  mist: "#edf4ef",
  teal: "#1f7a72",
  gold: "#d8a23a",
  coral: "#db6b5f",
  line: "rgba(24, 32, 31, 0.15)",
};

const labels = ["Intake", "Review", "Browser proof", "Fix loop", "Final report"];

const assetFor = (index: number) => {
  if (proofData.videos[index]) return { type: "video", src: proofData.videos[index] };
  const screenshot = proofData.screenshots[index % Math.max(proofData.screenshots.length, 1)];
  return { type: "image", src: screenshot };
};

const ProofAsset = ({ index }: { index: number }) => {
  const asset = assetFor(index);
  if (!asset.src) {
    return (
      <div className="asset-empty">
        <span>No visual asset</span>
      </div>
    );
  }
  if (asset.type === "video") {
    return (
      <OffthreadVideo
        src={staticFile(asset.src)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return (
    <Img
      src={staticFile(asset.src)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};

const BrowserFrame = ({ index }: { index: number }) => (
  <div className="browser-frame">
    <div className="browser-chrome">
      <span style={{ background: colors.coral }} />
      <span style={{ background: colors.gold }} />
      <span style={{ background: "#66b891" }} />
    </div>
    <div className="browser-body">
      <ProofAsset index={index} />
    </div>
  </div>
);

const Scene = ({ index, from, duration }: { index: number; from: number; duration: number }) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const opacity =
    interpolate(frame, [from, from + 20], [0, 1], { extrapolateRight: "clamp" }) *
    interpolate(frame, [from + duration - 20, from + duration], [1, 0], {
      extrapolateLeft: "clamp",
    });
  const y = interpolate(local, [0, 24], [18, 0], { extrapolateRight: "clamp" });
  const blockers = proofData.blockers.length > 0;
  const routeText = proofData.routesTested.length
    ? proofData.routesTested.slice(0, 3).join(", ")
    : "routes captured in manifest";

  const title =
    index === 0
      ? proofData.title
      : index === 1
        ? "Diff review and runtime diagnostics"
        : index === 2
          ? "Browser evidence was captured"
          : index === 3
            ? blockers
              ? "A hard blocker was proven"
              : "Verification loop reached a verdict"
            : "Artifacts are ready for review";

  const body =
    index === 0
      ? `Verdict: ${proofData.verdict}. The run gathered repo, diff, and definition-of-done context.`
      : index === 1
        ? `Commands and checks: ${proofData.commandsRun.slice(0, 3).join(", ") || "see report"}.`
        : index === 2
          ? `Routes and flows: ${routeText}. Screenshots, logs, and videos are linked in the report.`
          : index === 3
            ? blockers
              ? proofData.blockers.slice(0, 2).join(" ")
              : "The final state was compared against the requested definition of done."
            : "Open verification-report.md, manifest.json, screenshots, WebM recordings, logs, and this MP4.";

  return (
    <Sequence from={from} durationInFrames={duration} premountFor={30}>
      <AbsoluteFill className="scene" style={{ opacity, transform: `translateY(${y}px)` }}>
        <div className="copy">
          <div className="kicker">{labels[index] || "Proof"}</div>
          <h1>{title}</h1>
          <p>{body}</p>
          <div className="chips">
            <span>Verdict: {proofData.verdict}</span>
            <span>{proofData.screenshots.length} screenshots</span>
            <span>{proofData.videos.length} videos</span>
          </div>
        </div>
        <BrowserFrame index={index} />
      </AbsoluteFill>
    </Sequence>
  );
};

export const ProofVideo = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sceneDuration = Math.floor(durationInFrames / labels.length);
  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="root">
      {proofData.hasAudio ? <Audio src={staticFile("assets/narration.mp3")} /> : null}
      <div className="grid" />
      <header>
        <div className="logo">Z</div>
        <strong>Proof-Driven Verification</strong>
        <span>Agent Browser + Next.js MCP + Remotion</span>
      </header>
      {labels.map((_, index) => (
        <Scene
          key={index}
          index={index}
          from={index * sceneDuration}
          duration={index === labels.length - 1 ? durationInFrames - index * sceneDuration : sceneDuration}
        />
      ))}
      <div className="progress">
        <div style={{ width: `${progress}%` }} />
      </div>
    </AbsoluteFill>
  );
};
