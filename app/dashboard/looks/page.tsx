import { Clock, Images, Sparkles, XCircle } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { listTryOnSessions } from "@/lib/services/tryon-service";
import { cn } from "@/lib/utils";

const statusMeta: Record<
  string,
  { label: string; className: string; icon: typeof Clock | null }
> = {
  COMPLETED: { label: "Completed", className: "bg-emerald-500/90", icon: null },
  PROCESSING: { label: "Processing", className: "bg-[color:var(--qc-gold)]", icon: Clock },
  QUEUED: { label: "Queued", className: "bg-[color:var(--qc-violet)]", icon: Clock },
  FAILED: { label: "Failed", className: "bg-destructive", icon: XCircle },
  CANCELLED: { label: "Cancelled", className: "bg-muted-foreground", icon: XCircle },
};

export default async function LooksPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const { items, total } = await listTryOnSessions({ userId, pageSize: 50 });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-[color:var(--qc-magenta)] uppercase">
            Creations
          </p>
          <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">
            Every reveal, one gallery
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0
              ? `${total} generation${total === 1 ? "" : "s"} in your archive.`
              : "Review, download, and manage your generated fashion looks."}
          </p>
        </div>
        <Button
          render={<Link href="/dashboard/generate" />}
          className="gap-2 rounded-full gradient-purple-magenta px-5 text-primary-foreground"
        >
          <Sparkles className="size-4" />
          Generate a look
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No looks generated yet."
          description="Once you generate a virtual try-on, your reveals will appear here."
        />
      ) : (
        <Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((look) => {
              const meta = statusMeta[look.status] ?? statusMeta.QUEUED;
              return (
                <div
                  key={look.id}
                  className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-editorial"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    {look.resultUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={look.resultUrl}
                        alt={`Look for ${look.client.name}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="bg-grain flex h-full w-full items-center justify-center gradient-lavender-purple">
                        <Images className="size-7 text-white/70" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                    <span
                      className={cn(
                        "absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-white",
                        meta.className
                      )}
                    >
                      {meta.icon && <meta.icon className="size-3" />}
                      {meta.label}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="font-heading text-base text-white">{look.client.name}</p>
                      <p className="text-xs text-white/75">{look.garment.name}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      )}
    </div>
  );
}
