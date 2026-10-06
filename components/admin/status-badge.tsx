import { cn } from "@/lib/utils";
import type { TryOnStatusValue } from "@/lib/validations/admin";

export const tryOnStatusMeta: Record<TryOnStatusValue, { label: string; dot: string; badge: string }> = {
  COMPLETED: {
    label: "Completed",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  PROCESSING: {
    label: "Processing",
    dot: "bg-[color:var(--qc-gold)] animate-pulse",
    badge: "bg-[color:var(--qc-gold)]/15 text-[color:var(--qc-gold)]",
  },
  QUEUED: {
    label: "Queued",
    dot: "bg-[color:var(--qc-violet)] animate-pulse",
    badge: "bg-[color:var(--qc-violet)]/10 text-[color:var(--qc-violet)]",
  },
  FAILED: { label: "Failed", dot: "bg-destructive", badge: "bg-destructive/10 text-destructive" },
  CANCELLED: { label: "Cancelled", dot: "bg-muted-foreground", badge: "bg-muted text-muted-foreground" },
};

export function TryOnStatusBadge({ status }: { status: TryOnStatusValue }) {
  const meta = tryOnStatusMeta[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", meta.badge)}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
