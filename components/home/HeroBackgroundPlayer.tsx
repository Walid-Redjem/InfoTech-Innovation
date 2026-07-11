"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { HeroBackground } from "@/remotion/HeroBackground";

const RemotionPlayer = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
);

const FPS = 30;
const DURATION_IN_FRAMES = FPS * 16;

export default function HeroBackgroundPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mql.matches);
    const listener = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setSize({ width: Math.round(width), height: Math.round(height) });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {!reduceMotion && size && (
        <RemotionPlayer
          component={HeroBackground}
          durationInFrames={DURATION_IN_FRAMES}
          fps={FPS}
          compositionWidth={size.width}
          compositionHeight={size.height}
          style={{ width: "100%", height: "100%" }}
          loop
          autoPlay
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          allowFullscreen={false}
          initiallyMuted
        />
      )}
    </div>
  );
}
