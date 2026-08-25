import { Palette, Sparkles, Wand2 } from "lucide-react";

import { GradientBlob } from "@/components/decor/blobs";

/**
 * Purely abstract, illustrative hero composition — no fabricated
 * photography. Flowing gradient "fabric" shapes stand in for a garment in
 * motion, layered with glass UI cards that hint at the AI studio product
 * without claiming to be a real generated result.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
      <GradientBlob variant="violet" className="-top-10 -left-10 size-56" />
      <GradientBlob variant="coral" className="-bottom-8 -right-6 size-64" />

      <div className="bg-grain absolute inset-0 overflow-hidden rounded-[2rem] gradient-purple-magenta shadow-editorial">
        <svg
          aria-hidden
          viewBox="0 0 400 500"
          className="absolute inset-0 h-full w-full opacity-90"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="fabric-a" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--qc-coral)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--qc-gold)" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="fabric-b" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--qc-lavender)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--qc-violet)" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <path
            d="M60 480C40 380 90 300 70 200C55 128 110 60 200 40C290 20 360 90 340 170C325 232 250 240 260 320C270 400 220 460 140 486C110 496 75 500 60 480Z"
            fill="url(#fabric-a)"
          />
          <path
            d="M120 500C60 430 130 360 110 280C95 220 170 150 250 170C330 190 340 270 300 320C265 364 320 400 300 450C280 498 180 520 120 500Z"
            fill="url(#fabric-b)"
          />
          <path
            d="M200 60C230 130 190 190 220 260C245 316 300 350 280 420"
            stroke="var(--qc-cream)"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        <div className="absolute top-5 right-5 flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          <Sparkles className="size-3.5" />
          AI rendering
        </div>

        <div className="absolute top-5 left-5 flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md">
          <Wand2 className="size-4" />
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 w-48 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-editorial backdrop-blur-sm">
        <div className="mb-2 flex aspect-[3/4] items-center justify-center rounded-xl gradient-magenta-coral">
          <Palette className="size-6 text-white/90" />
        </div>
        <p className="font-heading text-sm leading-tight">Aurelia Sequin Slip</p>
        <p className="mt-0.5 text-[11px] tracking-wide text-muted-foreground uppercase">
          Evening &middot; Magenta
        </p>
      </div>
    </div>
  );
}
