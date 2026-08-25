import { Images, Plus, Shirt, Sparkles, Users, Wand2 } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { GradientBlob } from "@/components/decor/blobs";
import { StatCard } from "@/components/dashboard/stat-card";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { listClients } from "@/lib/services/client-service";
import { listGarments } from "@/lib/services/garment-service";
import { listTryOnSessions } from "@/lib/services/tryon-service";

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardHomePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const [garments, clients, completedLooks] = await Promise.all([
    listGarments({ userId, pageSize: 5 }),
    listClients({ userId, pageSize: 5 }),
    listTryOnSessions({ userId, pageSize: 6, status: "COMPLETED" }),
  ]);

  const swatchGradients = [
    "gradient-purple-magenta",
    "gradient-magenta-coral",
    "bg-[color:var(--qc-violet)]",
    "bg-[color:var(--qc-gold)]",
  ];

  const garmentSwatches = garments.items.slice(0, 4).map((g, i) => ({
    id: g.id,
    className: swatchGradients[i % swatchGradients.length],
  }));
  const clientSwatches = clients.items.slice(0, 4).map((c, i) => ({
    id: c.id,
    className: swatchGradients[(i + 1) % swatchGradients.length],
  }));

  const focus =
    garments.total === 0
      ? "Add your first piece to start building the closet."
      : clients.total === 0
        ? "Add a muse to begin styling your first look."
        : completedLooks.total === 0
          ? "Everything's in place — generate your very first look."
          : "Your atelier is warmed up. Keep the momentum going.";

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-8 shadow-editorial sm:p-10">
          <GradientBlob variant="purple" className="-top-16 -right-20 size-72" />
          <p className="relative text-xs font-medium tracking-[0.2em] text-[color:var(--qc-magenta)] uppercase">
            {new Date().toLocaleDateString("en-US", { weekday: "long" })} &middot; Atelier open
          </p>
          <h1 className="relative mt-3 font-heading text-4xl leading-tight sm:text-5xl">
            {timeOfDayGreeting()}, <span className="text-gradient-purple-magenta italic">Queen.</span>
          </h1>
          <p className="relative mt-2 max-w-md text-sm text-muted-foreground">
            Let&rsquo;s create something unforgettable.
          </p>

          <div className="relative mt-7 flex flex-wrap gap-3">
            <Button
              size="lg"
              render={<Link href="/dashboard/generate" />}
              className="h-11 gap-2 rounded-full gradient-purple-magenta px-5 text-primary-foreground shadow-editorial hover:opacity-95"
            >
              <Wand2 className="size-4" />
              Generate a look
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/dashboard/garments" />}
              className="h-11 gap-2 rounded-full border-border bg-card px-5"
            >
              <Plus className="size-4" />
              Add a garment
            </Button>
          </div>

          <div className="relative mt-8 flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3">
            <Sparkles className="size-4 shrink-0 text-[color:var(--qc-magenta)]" />
            <div>
              <p className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Today&rsquo;s focus
              </p>
              <p className="text-sm">{focus}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Reveal delay={0.05}>
          <StatCard
            icon={Shirt}
            label="Garments"
            value={garments.total}
            description="Pieces in your digital closet"
            href="/dashboard/garments"
            tint="purple"
            swatches={garmentSwatches}
          />
        </Reveal>
        <Reveal delay={0.1}>
          <StatCard
            icon={Users}
            label="Clients"
            value={clients.total}
            description="Muses in your portfolio"
            href="/dashboard/clients"
            tint="coral"
            swatches={clientSwatches}
          />
        </Reveal>
        <Reveal delay={0.15}>
          <StatCard
            icon={Wand2}
            label="AI Looks"
            value={completedLooks.total}
            description="Looks generated so far"
            href="/dashboard/looks"
            tint="gold"
          />
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-editorial sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-[color:var(--qc-magenta)] uppercase">
                Recent Creations
              </p>
              <h2 className="mt-1 font-heading text-2xl">Your latest reveals</h2>
            </div>
            <Button
              variant="ghost"
              render={<Link href="/dashboard/looks" />}
              className="gap-1 text-sm"
            >
              View all
            </Button>
          </div>

          {completedLooks.items.length > 0 ? (
            <div className="mt-6 flex gap-4 overflow-x-auto pb-1">
              {completedLooks.items.map((look) => (
                <Link
                  key={look.id}
                  href="/dashboard/looks"
                  className="group relative aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-2xl border border-border/70 shadow-editorial"
                >
                  {look.resultUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={look.resultUrl}
                      alt={`Generated look for ${look.client.name}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center gradient-purple-magenta">
                      <Images className="size-6 text-white/80" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 py-12 text-center">
              <Images className="mb-3 size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Your reveals will appear here once you generate a look.
              </p>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
