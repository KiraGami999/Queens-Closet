"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import type { DailyGenerationPoint } from "@/lib/services/admin-service";
import { cn } from "@/lib/utils";

function shortDay(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** 14-day stacked bar chart of generations. Bars grow in on mount; hovering
 * (or focusing) a day reveals its breakdown. */
export function GenerationTrendChart({ points }: { points: DailyGenerationPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const totals = points.map((p) => p.completed + p.failed + p.other);
  const max = Math.max(1, ...totals);
  const sum = totals.reduce((a, b) => a + b, 0);
  const focus = hovered !== null ? points[hovered] : null;

  return (
    <div>
      <div className="flex min-h-12 items-end justify-between gap-4">
        <AnimatePresence mode="wait">
          {focus ? (
            <motion.div
              key={focus.date}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-xs text-muted-foreground">{shortDay(focus.date)}</p>
              <p className="text-sm">
                <span className="font-medium text-emerald-600">{focus.completed} completed</span>
                <span className="text-muted-foreground"> · </span>
                <span className="font-medium text-destructive">{focus.failed} failed</span>
                {focus.other > 0 && (
                  <>
                    <span className="text-muted-foreground"> · </span>
                    <span className="font-medium text-[color:var(--qc-violet)]">{focus.other} other</span>
                  </>
                )}
              </p>
            </motion.div>
          ) : (
            <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
              <p className="text-sm font-medium">
                {sum} generation{sum === 1 ? "" : "s"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="hidden items-center gap-3 text-[11px] text-muted-foreground sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full gradient-purple-magenta" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[color:var(--qc-coral)]" /> Failed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[color:var(--qc-lavender)]" /> In flight / cancelled
          </span>
        </div>
      </div>

      <div className="mt-5 flex h-48 items-end gap-1.5 sm:gap-2" onPointerLeave={() => setHovered(null)}>
        {points.map((point, i) => {
          const total = totals[i]!;
          const height = total === 0 ? 3 : Math.max(8, (total / max) * 100);
          return (
            <button
              key={point.date}
              type="button"
              aria-label={`${shortDay(point.date)}: ${total} generations`}
              onPointerEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className="group flex h-full flex-1 flex-col justify-end outline-none"
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: i * 0.035, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "flex w-full flex-col-reverse overflow-hidden rounded-md transition-opacity",
                  total === 0 && "bg-border",
                  hovered !== null && hovered !== i && "opacity-40",
                  "group-focus-visible:ring-2 group-focus-visible:ring-ring"
                )}
              >
                {total > 0 && (
                  <>
                    <div className="gradient-purple-magenta" style={{ flexGrow: point.completed }} />
                    <div className="bg-[color:var(--qc-coral)]" style={{ flexGrow: point.failed }} />
                    <div className="bg-[color:var(--qc-lavender)]" style={{ flexGrow: point.other }} />
                  </>
                )}
              </motion.div>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] tracking-wide text-muted-foreground uppercase">
        <span>{shortDay(points[0]!.date)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}
