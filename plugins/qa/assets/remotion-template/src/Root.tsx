import { Composition } from "remotion";
import { QAVideo } from "./QAVideo";
import { proofData } from "./proof-data";
import "./style.css";

export const RemotionRoot = () => {
  return (
    <Composition
      id="QAVideo"
      component={QAVideo}
      durationInFrames={proofData.durationInFrames}
      fps={proofData.fps}
      width={1280}
      height={720}
    />
  );
};
