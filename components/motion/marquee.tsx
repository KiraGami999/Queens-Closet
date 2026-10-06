import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** CSS-only infinite marquee. Children are rendered twice so the loop is
 * seamless; the duplicate is hidden from assistive tech. Pauses on hover. */
export function Marquee({
  children,
  durationSeconds = 45,
  className,
}: {
  children: ReactNode;
  durationSeconds?: number;
  className?: string;
}) {
  return (
    <div className={cn("pause-on-hover mask-fade-x overflow-hidden", className)}>
      <div
        className="animate-marquee flex w-max"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        <div className="flex shrink-0 items-center gap-6 pr-6">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center gap-6 pr-6">
          {children}
        </div>
      </div>
    </div>
  );
}
