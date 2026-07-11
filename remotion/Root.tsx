import { Composition } from "remotion";
import { YouTubeIntro, type YouTubeIntroProps } from "./YouTubeIntro";

export const RemotionRoot = () => {
  return (
    <Composition
      id="YouTubeIntro"
      component={YouTubeIntro}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ transparent: false } satisfies YouTubeIntroProps}
    />
  );
};
