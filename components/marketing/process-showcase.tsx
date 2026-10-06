"use client";

import { Check, ImagePlus, UserRound, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const STEP_DURATION_MS = 3600;

const steps = [
  {
    index: "01",
    title: "Upload the garment",
    description: "Drop in flats, product shots or fabric studies from your closet.",
    status: "Garment received",
    image: "/catalogue/regent-belted-jacket.jpg",
    icon: ImagePlus,
  },
  {
    index: "02",
    title: "Choose the muse",
    description: "Pick a client portrait from your model portfolio.",
    status: "Muse selected",
    image: "/catalogue/noir-edit-lookbook.jpg",
    icon: UserRound,
  },
  {
    index: "03",
    title: "Generate the look",
    description: "AI drapes the piece and returns a campaign-ready frame.",
    status: "Creating your look…",
    image: "/catalogue/sculptural-ruffle-boots.jpg",
    icon: Wand2,
  },
] as const;

/** Auto-advancing walkthrough of the three-step flow. Steps are clickable,
 * and the cycle pauses while the visitor hovers the section. */
export function ProcessShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % steps.length), STEP_DURATION_MS);
    return () => clearTimeout(id);
  }, [active, paused]);

  const step = steps[active]!;

  return (
    <div
      className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <ol className="space-y-3">
        {steps.map((item, i) => {
          const isActive = i === active;
          const isDone = i < active;
          return (
            <li key={item.index}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "relative flex w-full gap-5 overflow-hidden rounded-2xl border p-5 text-left transition-colors duration-300",
                  isActive
                    ? "border-[color:var(--qc-magenta)]/30 bg-card shadow-editorial"
                    : "border-transparent hover:bg-card/60"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full font-heading text-sm transition-colors duration-300",
                    isActive
                      ? "gradient-purple-magenta text-white"
                      : isDone
                        ? "bg-[color:var(--qc-lavender)] text-[color:var(--qc-purple)]"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? <Check className="size-4" /> : item.index}
                </span>
                <span>
                  <span className="block font-heading text-lg">{item.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
                </span>
                {isActive && !paused && (
                  <motion.span
                    key={`progress-${active}`}
                    aria-hidden
                    className="absolute bottom-0 left-0 h-0.5 gradient-purple-magenta"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: STEP_DURATION_MS / 1000, ease: "linear" }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="bg-grain relative overflow-hidden rounded-[1.75rem] shadow-editorial">
        <div
          className="animate-mesh-shift aspect-[4/3] w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--qc-coral) 0%, transparent 45%), radial-gradient(circle at 80% 30%, var(--qc-gold) 0%, transparent 40%), radial-gradient(circle at 50% 90%, var(--qc-magenta) 0%, transparent 55%), linear-gradient(135deg, var(--qc-purple), var(--qc-magenta))",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.image}
              initial={{ opacity: 0, y: 24, rotate: -4, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, rotate: active === 1 ? 3 : -2, scale: 1 }}
              exit={{ opacity: 0, y: -16, rotate: 4, scale: 0.94 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-[3/4] w-[34%] overflow-hidden rounded-2xl border-4 border-white/80 shadow-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={step.image} alt="" className="h-full w-full object-cover" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/25 bg-white/15 px-5 py-4 backdrop-blur-md">
          <p className="flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] text-white/80 uppercase">
            <step.icon className="size-3.5" />
            Step {step.index} of 03
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={step.status}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="mt-1 font-heading text-lg text-white italic"
            >
              {step.status}
            </motion.p>
          </AnimatePresence>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/25">
            <motion.div
              className="h-full rounded-full bg-white"
              animate={{ width: `${((active + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
