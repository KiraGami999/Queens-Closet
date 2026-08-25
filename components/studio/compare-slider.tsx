"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function CompareSlider({
  beforeSrc,
  afterSrc,
  className,
}: {
  beforeSrc: string;
  afterSrc: string;
  className?: string;
}) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  function updateFromClientX(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[3/4] w-full touch-none overflow-hidden rounded-[1.75rem] select-none",
        className
      )}
      onPointerDown={(e) => {
        draggingRef.current = true;
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) updateFromClientX(e.clientX);
      }}
      onPointerUp={() => (draggingRef.current = false)}
      onPointerLeave={() => (draggingRef.current = false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterSrc} alt="AI generated result" className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeSrc} alt="Original photo" className="absolute inset-0 h-full w-full object-cover" />
      </div>

      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[color:var(--qc-purple)] shadow-editorial">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2L1 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 2L13 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <span className="absolute top-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white uppercase backdrop-blur-sm">
        Original
      </span>
      <span className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white uppercase backdrop-blur-sm">
        AI Generated
      </span>
    </div>
  );
}
