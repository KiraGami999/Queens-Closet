"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

import { GarmentCard, type GarmentCardData } from "@/components/dashboard/garment-card";
import { TiltCard } from "@/components/motion/tilt-card";
import { cn } from "@/lib/utils";
import { garmentCategoryLabels, type GarmentCategoryInput } from "@/lib/validations/garment";

type Filter = GarmentCategoryInput | "ALL";

export function GarmentGallery({ garments }: { garments: GarmentCardData[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");

  const categories = useMemo(() => {
    const present = new Set(garments.map((g) => g.category));
    return (Object.keys(garmentCategoryLabels) as GarmentCategoryInput[]).filter((c) => present.has(c));
  }, [garments]);

  const visible = filter === "ALL" ? garments : garments.filter((g) => g.category === filter);
  const filters: Filter[] = ["ALL", ...categories];

  return (
    <div className="space-y-6">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {filters.map((value) => {
          const active = value === filter;
          const count = value === "ALL" ? garments.length : garments.filter((g) => g.category === value).length;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={active}
              className={cn(
                "relative shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-transparent text-primary-foreground"
                  : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="garment-filter-pill"
                  className="absolute inset-0 rounded-full gradient-purple-magenta shadow-editorial"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">
                {value === "ALL" ? "All pieces" : garmentCategoryLabels[value]}
                <span className={cn("ml-1.5 text-xs", active ? "text-white/75" : "text-muted-foreground/70")}>
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((garment, index) => (
            <motion.div
              key={garment.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard className="rounded-3xl">
                <GarmentCard garment={garment} />
              </TiltCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
