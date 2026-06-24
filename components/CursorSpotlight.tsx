"use client";
import { useEffect, useRef } from "react";

export default function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.opacity = "1";
    };
    const leave = () => { if (el) el.style.opacity = "0"; };
    window.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed z-[1] hidden md:block opacity-0 transition-opacity duration-300"
      style={{
        width: 480,
        height: 480,
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(155,107,155,0.07) 0%, rgba(46,196,182,0.04) 40%, transparent 70%)",
        willChange: "left, top",
      }}
    />
  );
}
