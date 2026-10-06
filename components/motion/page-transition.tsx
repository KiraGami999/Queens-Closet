"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Gentle fade-and-rise on every route change (mounted from template.tsx). */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
