"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Sophisticated, restrained scroll-reveal — a small upward fade, never a
 * bounce. Used throughout marketing and gallery surfaces for a premium,
 * editorial feel rather than generic dashboard pop-ins.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 18,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
