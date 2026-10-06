import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { GradientBlob } from "@/components/decor/blobs";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  note,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  note?: string;
}) {
  return (
    <div className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border/70 bg-card/40 px-6 py-20 text-center">
      <GradientBlob variant="purple" className="top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 animate-pulse opacity-20 [animation-duration:5s]" />
      <div className="relative mb-6 flex size-16 items-center justify-center rounded-full gradient-lavender-purple shadow-editorial">
        <span className="absolute inset-0 animate-ping rounded-full bg-[color:var(--qc-lavender)] opacity-30 [animation-duration:2.8s]" />
        <Icon className="relative size-6 text-white" />
      </div>
      <h2 className="relative font-heading text-2xl italic">{title}</h2>
      <p className="relative mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="relative mt-6">{action}</div>}
      {note && <p className="relative mt-3 text-xs text-muted-foreground/70">{note}</p>}
    </div>
  );
}
