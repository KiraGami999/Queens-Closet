"use client";

import { Sparkles, Wand2 } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent } from "react";

import { GradientBlob } from "@/components/decor/blobs";

/**
 * Fashion-editorial hero composition layered with a client product shot —
 * the Regent Belted Jacket from the Noir Edit capsule — plus glass UI cues
 * that hint at the AI studio without claiming a fake generated result.
 * Layers drift at different depths as the pointer moves (parallax).
 */
export function HeroVisual() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 120, damping: 18, mass: 0.5 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  const imageRotateX = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const imageRotateY = useTransform(sx, [-0.5, 0.5], [-6, 6]);
  const cardX = useTransform(sx, [-0.5, 0.5], [18, -18]);
  const cardY = useTransform(sy, [-0.5, 0.5], [14, -14]);
  const badgeX = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const blobX = useTransform(sx, [-0.5, 0.5], [-24, 24]);
  const blobY = useTransform(sy, [-0.5, 0.5], [-24, 24]);

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <div
      onPointerMove={handleMove}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="relative mx-auto aspect-[4/5] w-full max-w-[20rem] sm:max-w-md"
      style={{ perspective: 1100 }}
    >
      <motion.div aria-hidden style={{ x: blobX, y: blobY }} className="absolute inset-0">
        <GradientBlob variant="violet" className="-top-10 -left-10 size-56" />
        <GradientBlob variant="coral" className="-bottom-8 -right-6 size-64" />
      </motion.div>

      <motion.div
        style={{ rotateX: imageRotateX, rotateY: imageRotateY }}
        className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-editorial ring-1 ring-black/5"
      >
        <motion.img
          src="/catalogue/regent-belted-jacket.jpg"
          alt="Regent Belted Jacket"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <motion.div
          aria-hidden
          className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          animate={{ x: ["0%", "450%"] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3.2, ease: "easeInOut" }}
        />

        <motion.div
          style={{ x: badgeX }}
          className="absolute top-5 right-5 flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--qc-pink)] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[color:var(--qc-pink)]" />
          </span>
          <Sparkles className="size-3.5" />
          AI rendering
        </motion.div>

        <div className="absolute top-5 left-5 flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md">
          <Wand2 className="size-4" />
        </div>
      </motion.div>

      <motion.div
        style={{ x: cardX, y: cardY }}
        className="absolute -bottom-4 left-3 w-36 sm:-bottom-6 sm:-left-6 sm:w-48"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-2.5 shadow-editorial backdrop-blur-sm sm:p-3"
        >
          <div className="mb-2 aspect-[3/4] overflow-hidden rounded-xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/catalogue/sculptural-ruffle-boots.jpg"
              alt="Sculptural Ruffle Boots"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="font-heading text-xs leading-tight sm:text-sm">Sculptural Ruffle Boots</p>
          <p className="mt-0.5 text-[11px] tracking-wide text-muted-foreground uppercase">
            Footwear &middot; Black
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
