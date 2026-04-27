import { Composition } from "remotion";
import { QAVideo } from "./QAVideo";
import { SegmentVideo } from "./SegmentVideo";
import { proofData } from "./proof-data";
import "./style.css";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="QAVideo"
        component={QAVideo}
        durationInFrames={proofData.durationInFrames}
        fps={proofData.fps}
        width={1280}
        height={720}
      />
      <Composition
        id="QASegment"
        component={SegmentVideo}
        durationInFrames={proofData.durationInFrames}
        fps={proofData.fps}
        width={1280}
        height={720}
      />
    </>
  );
};
