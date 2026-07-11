import {
  AbsoluteFill,
  Img,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { RobotIcon } from "./RobotIcon";

const { fontFamily } = loadFont("normal", {
  weights: ["700", "800"],
  subsets: ["latin"],
});

// Matches the site header exactly (components/layout/Navbar.tsx)
const BG = "linear-gradient(to right, #6B35A0 0%, #7B45A8 65%, #29B6F6 100%)";
const ELECTRIC_BLUE = "#00D4FF";
const MAUVE = "#9B6B9B";
const TURQUOISE = "#2EC4B6";

const CHANNEL_NAME = "InfoTech Innovation";
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#________";

// Per-letter reveal is staggered across this window (frames), each letter
// gets its own short scramble burst before locking to the real character.
const LETTERS_START = 0;
const LETTERS_END = 58; // ~1.93s @ 30fps, reads as "over 2 seconds"
const SCRAMBLE_LEN = 8;

// Line expands from center outward right after the text locks in.
const LINE_START = 58;
const LINE_END = 88;

// Brand tagline glitches in after the line.
const TAGLINE_START = 92;
const TAGLINE_END = 112;

// Everything scales down + fades for the outro.
const OUTRO_START = 150;
const OUTRO_END = 180;

function GlitchLetter({
  char,
  index,
  revealFrame,
}: {
  char: string;
  index: number;
  revealFrame: number;
}) {
  const frame = useCurrentFrame();
  const framesSinceReveal = frame - revealFrame;

  if (framesSinceReveal < 0) {
    return <span style={{ opacity: 0 }}>{char === " " ? " " : char}</span>;
  }

  const isScrambling = framesSinceReveal < SCRAMBLE_LEN;

  if (char === " ") {
    return <span>{" "}</span>;
  }

  if (isScrambling) {
    const r1 = random(`glitch-${index}-${frame}`);
    const showReal = r1 > 0.55;
    const displayChar = showReal
      ? char
      : GLITCH_CHARS[Math.floor(random(`glitch-char-${index}-${frame}`) * GLITCH_CHARS.length)];

    const jitterX = (random(`jx-${index}-${frame}`) - 0.5) * 6;
    const jitterY = (random(`jy-${index}-${frame}`) - 0.5) * 4;
    const colorRoll = random(`color-${index}-${frame}`);
    const color =
      colorRoll < 0.33 ? ELECTRIC_BLUE : colorRoll < 0.66 ? TURQUOISE : MAUVE;
    const opacity = 0.55 + random(`op-${index}-${frame}`) * 0.45;

    return (
      <span
        style={{
          display: "inline-block",
          transform: `translate(${jitterX}px, ${jitterY}px)`,
          color,
          opacity,
          textShadow: `${jitterX > 0 ? -2 : 2}px 0 0 ${ELECTRIC_BLUE}88, ${
            jitterX > 0 ? 2 : -2
          }px 0 0 ${MAUVE}66`,
        }}
      >
        {displayChar}
      </span>
    );
  }

  // Settled: small spring pop-in, no more jitter.
  const settleProgress = spring({
    frame: framesSinceReveal - SCRAMBLE_LEN,
    fps: 30,
    config: { damping: 12, stiffness: 200 },
  });
  const scale = interpolate(settleProgress, [0, 1], [0.7, 1]);

  return (
    <span
      style={{
        display: "inline-block",
        scale,
        color: "#FFFFFF",
        textShadow: `0 0 18px ${ELECTRIC_BLUE}55`,
      }}
    >
      {char}
    </span>
  );
}

export type YouTubeIntroProps = {
  transparent?: boolean;
};

export function YouTubeIntro({ transparent = false }: YouTubeIntroProps) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Subtle handheld camera shake, tapering off before the outro.
  const shakeEnvelope = interpolate(frame, [0, 20, OUTRO_START - 10, OUTRO_START], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shakeX = (random(`shake-x-${Math.floor(frame / 2)}`) - 0.5) * 3 * shakeEnvelope;
  const shakeY = (random(`shake-y-${Math.floor(frame / 2)}`) - 0.5) * 3 * shakeEnvelope;

  // Logo glitches in just ahead of the text.
  const logoOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = spring({ frame, fps: 30, config: { damping: 14, stiffness: 180 } });

  const lineProgress = interpolate(frame, [LINE_START, LINE_END], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, Math.min(width * 0.5, 640)]);

  const taglineOpacity = interpolate(frame, [TAGLINE_START, TAGLINE_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [TAGLINE_START, TAGLINE_END], [10, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Outro: scale down slightly + fade everything.
  const outroProgress = interpolate(frame, [OUTRO_START, OUTRO_END], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outroScale = interpolate(outroProgress, [0, 1], [1, 0.92]);
  const outroOpacity = interpolate(outroProgress, [0, 1], [1, 0]);

  const chars = CHANNEL_NAME.split("");
  const letterFrameSpan = LETTERS_END - LETTERS_START - SCRAMBLE_LEN;

  return (
    <AbsoluteFill
      style={{ background: transparent ? "transparent" : BG, overflow: "hidden" }}
    >
      {/* subtle edge vignette for depth, background-agnostic */}
      {!transparent && (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.28) 100%)",
          }}
        />
      )}

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${outroScale})`,
          opacity: outroOpacity,
        }}
      >
        <Img
          src={staticFile("logo.png")}
          style={{
            width: 96,
            height: 96,
            objectFit: "contain",
            opacity: logoOpacity,
            scale: interpolate(logoScale, [0, 1], [0.6, 1]),
            marginBottom: 28,
            filter: `drop-shadow(0 0 20px ${ELECTRIC_BLUE}66)`,
          }}
        />

        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 88,
            letterSpacing: -1,
            display: "flex",
            whiteSpace: "pre",
          }}
        >
          {chars.map((char, i) => {
            const revealFrame =
              LETTERS_START + Math.round((i / chars.length) * letterFrameSpan);
            return (
              <GlitchLetter key={i} char={char} index={i} revealFrame={revealFrame} />
            );
          })}
        </div>

        <div
          style={{
            marginTop: 28,
            width: lineWidth,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${ELECTRIC_BLUE}, transparent)`,
            boxShadow: `0 0 12px ${ELECTRIC_BLUE}`,
          }}
        />

        <div style={{ marginTop: 14 }}>
          <RobotIcon frame={frame} appearAt={TAGLINE_START} color={ELECTRIC_BLUE} />
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: ELECTRIC_BLUE,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
        >
          Community Innovation Platform
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
