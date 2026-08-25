import type { LucideIcon } from "lucide-react";

import { GradientBlob } from "@/components/decor/blobs";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  note,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  note?: string;
}) {
  return (
    <div className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border/70 bg-card/40 px-6 py-20 text-center">
      <GradientBlob variant="purple" className="top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 opacity-20" />
      <div className="relative mb-6 flex size-16 items-center justify-center rounded-full gradient-lavender-purple shadow-editorial">
        <Icon className="size-6 text-white" />
      </div>
      <h2 className="relative font-heading text-2xl italic">{title}</h2>
      <p className="relative mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && (
        <Button
          disabled
          className="relative mt-6 rounded-full gradient-purple-magenta px-6 text-primary-foreground"
        >
          {actionLabel}
        </Button>
      )}
      {note && <p className="relative mt-3 text-xs text-muted-foreground/70">{note}</p>}
    </div>
  );
}
