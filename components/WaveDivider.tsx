export default function WaveDivider({ fill = "#ffffff", flip = false, className = "" }: { fill?: string; flip?: boolean; className?: string }) {
  return (
    <div className={`overflow-hidden leading-none ${flip ? "rotate-180" : ""} ${className}`} aria-hidden>
      <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full block" style={{ height: 56 }}>
        <path
          d="M0,28 C240,56 480,0 720,28 C960,56 1200,0 1440,28 L1440,56 L0,56 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
