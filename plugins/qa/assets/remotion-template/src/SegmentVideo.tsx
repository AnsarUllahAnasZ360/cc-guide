import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { proofData } from "./proof-data";

const segmentData = proofData as unknown as {
  segmentKind?: string;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  bullets?: readonly string[];
  statusLabel?: string;
  footer?: string;
};

export const SegmentVideo = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 24], [18, 0], { extrapolateRight: "clamp" });
  const bullets = (segmentData.bullets || []).slice(0, 4);

  return (
    <AbsoluteFill className={`segmentRoot ${segmentData.segmentKind || "intro"}`}>
      <div className="segmentGrid" />
      <section className="segmentCopy" style={{ opacity, transform: `translateY(${y}px)` }}>
        <div className="segmentEyebrow">{segmentData.eyebrow || "Founder proof"}</div>
        <h1>{segmentData.title || "QA proof walkthrough"}</h1>
        {segmentData.subtitle ? <p>{segmentData.subtitle}</p> : null}
        {bullets.length ? (
          <div className="segmentBullets">
            {bullets.map((bullet) => (
              <div className="segmentBullet" key={bullet}>
                <span />
                <strong>{bullet}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </section>
      <footer className="segmentFooter">
        <span>{segmentData.statusLabel || "evidence recorded"}</span>
        <span>{segmentData.footer || "Generated from QA evidence"}</span>
      </footer>
    </AbsoluteFill>
  );
};
