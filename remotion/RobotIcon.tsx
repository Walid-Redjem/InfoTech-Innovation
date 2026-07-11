import { interpolate, spring, Easing } from "remotion";

// A line-art robot in the same thin-glowing-stroke style as the circuit
// overlay / title underline. Arms hang straight down at rest and rotate
// outward into an open "welcome" pose. Rotation math: each arm is a line
// drawn straight down from its shoulder pivot; rotating it +135deg (left)
// or -135deg (right) swings it up and outward instead of just sideways.
export function RobotIcon({
  frame,
  appearAt,
  color,
}: {
  frame: number;
  appearAt: number;
  color: string;
}) {
  const openT = spring({
    frame: frame - appearAt,
    fps: 30,
    config: { damping: 11, stiffness: 120 },
  });
  const opacity = interpolate(frame, [appearAt - 4, appearAt + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [appearAt - 4, appearAt + 10], [0.7, 1], {
    easing: Easing.out(Easing.back(1.5)),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const armAngleLeft = interpolate(openT, [0, 1], [0, 135]);
  const armAngleRight = interpolate(openT, [0, 1], [0, -135]);

  return (
    <svg
      width={72}
      height={72}
      viewBox="0 0 100 100"
      style={{
        opacity,
        scale,
        filter: `drop-shadow(0 0 6px ${color}aa)`,
        overflow: "visible",
      }}
    >
      {/* antenna */}
      <line x1={50} y1={6} x2={50} y2={14} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <circle cx={50} cy={4} r={3} fill={color} />

      {/* head */}
      <rect x={34} y={14} width={32} height={26} rx={9} stroke={color} strokeWidth={3} fill="none" />
      <circle cx={43} cy={27} r={2.6} fill={color} />
      <circle cx={57} cy={27} r={2.6} fill={color} />

      {/* body */}
      <rect x={30} y={44} width={40} height={34} rx={11} stroke={color} strokeWidth={3} fill="none" />

      {/* left arm, pivoting at the shoulder */}
      <g transform={`rotate(${armAngleLeft} 31 50)`}>
        <line x1={31} y1={50} x2={31} y2={76} stroke={color} strokeWidth={3} strokeLinecap="round" />
        <circle cx={31} cy={78} r={4} fill="none" stroke={color} strokeWidth={3} />
      </g>

      {/* right arm, mirrored */}
      <g transform={`rotate(${armAngleRight} 69 50)`}>
        <line x1={69} y1={50} x2={69} y2={76} stroke={color} strokeWidth={3} strokeLinecap="round" />
        <circle cx={69} cy={78} r={4} fill="none" stroke={color} strokeWidth={3} />
      </g>
    </svg>
  );
}
