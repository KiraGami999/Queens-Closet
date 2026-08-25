import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  description,
  href,
  tint = "purple",
  swatches,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  description: string;
  href: string;
  tint?: "purple" | "coral" | "gold";
  swatches?: Array<{ id: string; className: string }>;
  className?: string;
}) {
  const tintClass: Record<typeof tint, string> = {
    purple: "from-[color:var(--qc-lavender)]/70 via-card to-card",
    coral: "from-[color:var(--qc-pink)]/40 via-card to-card",
    gold: "from-[color:var(--qc-gold)]/25 via-card to-card",
  };
  const iconTint: Record<typeof tint, string> = {
    purple: "gradient-purple-magenta",
    coral: "gradient-magenta-coral",
    gold: "bg-[color:var(--qc-gold)]",
  };

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br p-6 shadow-editorial transition-transform duration-300 hover:-translate-y-1",
        tintClass[tint],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {label}
        </p>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full text-white transition-transform group-hover:scale-105",
            iconTint[tint]
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <div className="mt-6">
        <p className="font-heading text-4xl leading-none">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      {swatches && swatches.length > 0 && (
        <div className="mt-5 flex -space-x-2">
          {swatches.map((swatch) => (
            <span
              key={swatch.id}
              className={cn(
                "size-7 rounded-full border-2 border-card",
                swatch.className
              )}
            />
          ))}
        </div>
      )}
    </Link>
  );
}
