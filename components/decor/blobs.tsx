import { cn } from "@/lib/utils";

/**
 * Soft, organic gradient blobs used as background atmosphere across marketing
 * and dashboard surfaces. Purely decorative — always aria-hidden, never
 * interactive, and layered behind content with low opacity.
 */
export function GradientBlob({
  className,
  variant = "purple",
}: {
  className?: string;
  variant?: "purple" | "coral" | "gold" | "violet";
}) {
  const gradients: Record<typeof variant, string> = {
    purple: "from-[color:var(--qc-purple)] to-[color:var(--qc-magenta)]",
    coral: "from-[color:var(--qc-magenta)] to-[color:var(--qc-coral)]",
    gold: "from-[color:var(--qc-gold)] to-[color:var(--qc-coral)]",
    violet: "from-[color:var(--qc-violet)] to-[color:var(--qc-lavender)]",
  };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute rounded-full bg-gradient-to-br opacity-40 blur-3xl",
        gradients[variant],
        className
      )}
    />
  );
}

/** A hand-drawn-feeling curved accent line, used to punctuate section breaks. */
export function ScribbleLine({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 20"
      className={cn("pointer-events-none w-24 text-[color:var(--qc-magenta)]", className)}
      fill="none"
    >
      <path
        d="M2 14C24 4 46 4 68 12C90 20 112 4 134 8C156 12 178 4 198 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Fine decorative underline stroke beneath emphasised words. */
export function UnderlineStroke({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 12"
      className={cn("pointer-events-none w-full text-[color:var(--qc-coral)]", className)}
      fill="none"
    >
      <path
        d="M2 9C24 3 60 3 118 6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Subtle full-bleed grain layer, sits above gradients to keep them premium, not flat. */
export function GrainOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
