import { Composition } from "remotion";
import { ProofVideo } from "./ProofVideo";
import { proofData } from "./proof-data";
import "./style.css";

export const RemotionRoot = () => {
  return (
    <Composition
      id="ProofVideo"
      component={ProofVideo}
      durationInFrames={proofData.durationInFrames}
      fps={proofData.fps}
      width={1280}
      height={720}
    />
  );
};
