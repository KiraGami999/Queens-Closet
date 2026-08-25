"use client";

import { motion } from "motion/react";

/**
 * Fashion-inspired generation state — an animated colour mesh with a
 * "stitching" thread line drawing itself, instead of a generic spinner.
 */
export function GeneratingOverlay({ label = "Creating your look…" }: { label?: string }) {
  return (
    <div
      className="animate-mesh-shift absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-[inherit]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, var(--qc-coral) 0%, transparent 45%), radial-gradient(circle at 80% 30%, var(--qc-gold) 0%, transparent 40%), radial-gradient(circle at 50% 90%, var(--qc-magenta) 0%, transparent 55%), linear-gradient(135deg, var(--qc-purple), var(--qc-violet))",
      }}
    >
      <svg width="120" height="24" viewBox="0 0 120 24" aria-hidden className="text-white/90">
        <path
          d="M2 12C22 2 42 22 62 12C82 2 102 22 118 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-stitch"
        />
      </svg>
      <motion.p
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="font-heading text-xl text-white italic"
      >
        {label}
      </motion.p>
      <p className="text-[11px] tracking-[0.2em] text-white/70 uppercase">
        Draping the fabric, frame by frame
      </p>
    </div>
  );
}
