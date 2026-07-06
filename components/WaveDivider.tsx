export default function WaveDivider({ fill = "#C9B0DF", flip = false, className = "" }: { fill?: string; flip?: boolean; className?: string }) {
  return (
    <div className={`overflow-hidden leading-none ${flip ? "rotate-180" : ""} ${className}`} aria-hidden>
      <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="w-full block" style={{ height: 64 }}>
        {/* Depth shadow wave */}
        <path
          d="M0,32 C240,60 480,4 720,32 C960,60 1200,4 1440,32 L1440,64 L0,64 Z"
          fill="rgba(155,107,155,0.15)"
          transform="translate(0, 8)"
        />
        {/* Main wave */}
        <path
          d="M0,32 C240,60 480,4 720,32 C960,60 1200,4 1440,32 L1440,64 L0,64 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
