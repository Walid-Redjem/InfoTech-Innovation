import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CircuitOverlay } from "./CircuitOverlay";

type Blob = {
  color: string;
  size: number;
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  freqX: number;
  freqY: number;
  phase: number;
  opacity: number;
  blur: number;
};

// freqX/freqY must be integers so each blob completes a whole number of
// orbits per loop and returns exactly to its start — that's what makes the
// loop seamless instead of snapping at the wrap point.
const BLOBS: Blob[] = [
  { color: "#9B6B9B", size: 640, baseX: 18, baseY: 32, ampX: 16, ampY: 14, freqX: 1, freqY: 1, phase: 0, opacity: 0.36, blur: 120 },
  { color: "#2EC4B6", size: 520, baseX: 80, baseY: 22, ampX: 14, ampY: 20, freqX: 2, freqY: 2, phase: 2.1, opacity: 0.3, blur: 100 },
  { color: "#D9C5E8", size: 700, baseX: 52, baseY: 80, ampX: 18, ampY: 12, freqX: 1, freqY: 1, phase: 4.2, opacity: 0.4, blur: 130 },
  { color: "#25a99d", size: 320, baseX: 12, baseY: 78, ampX: 12, ampY: 16, freqX: 3, freqY: 3, phase: 1.4, opacity: 0.24, blur: 80 },
  { color: "#7A5580", size: 380, baseX: 88, baseY: 66, ampX: 15, ampY: 13, freqX: 2, freqY: 2, phase: 3.5, opacity: 0.26, blur: 90 },
];

export function HeroBackground() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = (frame / durationInFrames) * Math.PI * 2;

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      {BLOBS.map((b, i) => {
        const x = b.baseX + Math.sin(t * b.freqX + b.phase) * b.ampX;
        const y = b.baseY + Math.cos(t * b.freqY + b.phase) * b.ampY;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: b.size,
              height: b.size,
              background: b.color,
              borderRadius: "50%",
              filter: `blur(${b.blur}px)`,
              opacity: b.opacity,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
      <CircuitOverlay />
    </AbsoluteFill>
  );
}
