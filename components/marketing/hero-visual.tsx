import { Sparkles, Wand2 } from "lucide-react";

import { GradientBlob } from "@/components/decor/blobs";

/**
 * Fashion-editorial hero composition layered with a client product shot —
 * the Regent Belted Jacket from the Noir Edit capsule — plus glass UI cues
 * that hint at the AI studio without claiming a fake generated result.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
      <GradientBlob variant="violet" className="-top-10 -left-10 size-56" />
      <GradientBlob variant="coral" className="-bottom-8 -right-6 size-64" />

      <div className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-editorial ring-1 ring-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/catalogue/regent-belted-jacket.jpg"
          alt="Regent Belted Jacket"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <div className="absolute top-5 right-5 flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          <Sparkles className="size-3.5" />
          AI rendering
        </div>

        <div className="absolute top-5 left-5 flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md">
          <Wand2 className="size-4" />
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 w-48 overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-3 shadow-editorial backdrop-blur-sm">
        <div className="mb-2 aspect-[3/4] overflow-hidden rounded-xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/catalogue/sculptural-ruffle-boots.jpg"
            alt="Sculptural Ruffle Boots"
            className="h-full w-full object-cover"
          />
        </div>
        <p className="font-heading text-sm leading-tight">Sculptural Ruffle Boots</p>
        <p className="mt-0.5 text-[11px] tracking-wide text-muted-foreground uppercase">
          Footwear &middot; Black
        </p>
      </div>
    </div>
  );
}
