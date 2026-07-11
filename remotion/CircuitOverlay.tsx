import { useCurrentFrame, useVideoConfig } from "remotion";

type Node = {
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  freqX: number;
  freqY: number;
  phase: number;
  pulseFreq: number;
  pulsePhase: number;
};

// All freq values are integers so every node/pulse returns exactly to its
// starting state once loopProgress wraps from 1 back to 0 — seamless loop.
const NODES: Node[] = [
  { baseX: 8, baseY: 15, ampX: 2, ampY: 2.5, freqX: 1, freqY: 2, phase: 0.2, pulseFreq: 2, pulsePhase: 0 },
  { baseX: 25, baseY: 8, ampX: 2.5, ampY: 2, freqX: 2, freqY: 1, phase: 1.1, pulseFreq: 3, pulsePhase: 1 },
  { baseX: 45, baseY: 12, ampX: 2, ampY: 2.5, freqX: 1, freqY: 3, phase: 2.4, pulseFreq: 2, pulsePhase: 2 },
  { baseX: 65, baseY: 10, ampX: 2.5, ampY: 2, freqX: 3, freqY: 1, phase: 0.8, pulseFreq: 4, pulsePhase: 0.5 },
  { baseX: 90, baseY: 18, ampX: 2, ampY: 2.5, freqX: 2, freqY: 2, phase: 3.3, pulseFreq: 3, pulsePhase: 1.5 },
  { baseX: 92, baseY: 55, ampX: 2.5, ampY: 2, freqX: 1, freqY: 3, phase: 1.9, pulseFreq: 2, pulsePhase: 2.5 },
  { baseX: 88, baseY: 85, ampX: 2, ampY: 2.5, freqX: 3, freqY: 2, phase: 4.1, pulseFreq: 3, pulsePhase: 0.2 },
  { baseX: 60, baseY: 90, ampX: 2.5, ampY: 2, freqX: 2, freqY: 1, phase: 0.5, pulseFreq: 4, pulsePhase: 1.8 },
  { baseX: 30, baseY: 88, ampX: 2, ampY: 2.5, freqX: 1, freqY: 2, phase: 2.7, pulseFreq: 2, pulsePhase: 3 },
  { baseX: 8, baseY: 70, ampX: 2.5, ampY: 2, freqX: 3, freqY: 3, phase: 1.4, pulseFreq: 3, pulsePhase: 0.9 },
  { baseX: 5, baseY: 45, ampX: 2, ampY: 2.5, freqX: 2, freqY: 1, phase: 3.6, pulseFreq: 2, pulsePhase: 2.2 },
  { baseX: 50, baseY: 50, ampX: 1.5, ampY: 1.5, freqX: 1, freqY: 1, phase: 0, pulseFreq: 3, pulsePhase: 0 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
  [7, 8], [8, 9], [9, 10], [10, 0],
  [1, 11], [5, 11], [8, 11],
];

const PULSE_EDGES: { edge: [number, number]; laps: number; phase: number }[] = [
  { edge: [0, 1], laps: 2, phase: 0 },
  { edge: [3, 4], laps: 3, phase: 0.3 },
  { edge: [6, 7], laps: 2, phase: 0.6 },
  { edge: [9, 10], laps: 3, phase: 0.1 },
  { edge: [1, 11], laps: 2, phase: 0.5 },
];

export function CircuitOverlay() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = (frame / durationInFrames) * Math.PI * 2;
  const loopProgress = frame / durationInFrames;

  const positions = NODES.map((n) => ({
    x: n.baseX + Math.sin(t * n.freqX + n.phase) * n.ampX,
    y: n.baseY + Math.cos(t * n.freqY + n.phase) * n.ampY,
    pulse: 0.5 + 0.5 * Math.sin(t * n.pulseFreq + n.pulsePhase),
  }));

  return (
    <>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {EDGES.map(([a, b], i) => {
          const pa = positions[a];
          const pb = positions[b];
          return (
            <line
              key={i}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke="#2EC4B6"
              strokeWidth={0.15}
              opacity={0.22}
            />
          );
        })}
      </svg>

      {positions.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: i % 2 === 0 ? "#2EC4B6" : "#9B6B9B",
            opacity: 0.35 + p.pulse * 0.4,
            boxShadow: `0 0 ${4 + p.pulse * 6}px ${i % 2 === 0 ? "#2EC4B6" : "#9B6B9B"}`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {PULSE_EDGES.map(({ edge: [a, b], laps, phase }, i) => {
        const pa = positions[a];
        const pb = positions[b];
        const progress = (loopProgress * laps + phase) % 1;
        const x = pa.x + (pb.x - pa.x) * progress;
        const y = pa.y + (pb.y - pa.y) * progress;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#ffffff",
              opacity: 0.85,
              boxShadow: "0 0 8px 2px #2EC4B6",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </>
  );
}
