"use client";

import { motion } from "motion/react";

import { tryOnStatusMeta } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";
import type { TryOnStatusValue } from "@/lib/validations/admin";

const ORDER: TryOnStatusValue[] = ["COMPLETED", "PROCESSING", "QUEUED", "FAILED", "CANCELLED"];

export function StatusBreakdown({ counts }: { counts: Record<TryOnStatusValue, number> }) {
  const total = ORDER.reduce((sum, status) => sum + counts[status], 0);

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {total > 0 &&
          ORDER.filter((status) => counts[status] > 0).map((status, i) => (
            <motion.div
              key={status}
              initial={{ width: 0 }}
              animate={{ width: `${(counts[status] / total) * 100}%` }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={cn("h-full", tryOnStatusMeta[status].dot.replace("animate-pulse", ""))}
            />
          ))}
      </div>
      <ul className="mt-5 space-y-2.5">
        {ORDER.map((status) => (
          <li key={status} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className={cn("size-2 rounded-full", tryOnStatusMeta[status].dot)} />
              {tryOnStatusMeta[status].label}
            </span>
            <span className="font-medium tabular-nums">
              {counts[status]}
              <span className="ml-2 text-xs text-muted-foreground">
                {total > 0 ? `${Math.round((counts[status] / total) * 100)}%` : "—"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
