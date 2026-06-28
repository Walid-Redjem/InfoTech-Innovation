"use client";
import { useEffect, useState } from "react";

const SECTIONS = ["hero","stats","marquee","about","services"];

export default function FloatingSectionDots() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf: number;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollable <= 0) return;
        const pct = window.scrollY / scrollable;
        setActive(Math.min(Math.floor(pct * SECTIONS.length), SECTIONS.length - 1));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed end-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-2">
      {SECTIONS.map((_, i) => (
        <button
          key={i}
          onClick={() => window.scrollTo({ top: (i / SECTIONS.length) * (document.documentElement.scrollHeight - window.innerHeight), behavior: "smooth" })}
          className={`rounded-full transition-all duration-300 ${i === active ? "w-2 h-5 bg-mauve shadow-sm shadow-mauve/40" : "w-1.5 h-1.5 bg-gray-300 hover:bg-mauve/50"}`}
          aria-label={`Section ${i + 1}`}
        />
      ))}
      <div className="w-[1px] h-8 mt-1 bg-gradient-to-b from-mauve to-transparent rounded-full opacity-30" />
    </div>
  );
}
