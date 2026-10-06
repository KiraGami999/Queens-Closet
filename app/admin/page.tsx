import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  HardDrive,
  KeyRound,
  Shirt,
  Sparkles,
  Users,
  Wand2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { GenerationTrendChart } from "@/components/admin/generation-trend-chart";
import { StatusBreakdown } from "@/components/admin/status-breakdown";
import { GradientBlob } from "@/components/decor/blobs";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Reveal } from "@/components/motion/reveal";
import { getAdminOrRedirect } from "@/lib/auth/admin-guard";
import {
  getPlatformOverview,
  getSystemHealth,
  listAuditLogs,
  type HealthCheck,
} from "@/lib/services/admin-service";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/format";

const healthIcons: Record<string, LucideIcon> = {
  database: Database,
  ai: Wand2,
  storage: HardDrive,
  auth: KeyRound,
};

const healthTone: Record<HealthCheck["status"], { icon: LucideIcon; className: string; label: string }> = {
  ok: { icon: CheckCircle2, className: "text-emerald-600", label: "Healthy" },
  warning: { icon: AlertTriangle, className: "text-[color:var(--qc-gold)]", label: "Attention" },
  error: { icon: XCircle, className: "text-destructive", label: "Action needed" },
};

function Panel({
  eyebrow,
  title,
  action,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-border/70 bg-card p-6 shadow-editorial", className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-[color:var(--qc-magenta)] uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-heading text-xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function AdminOverviewPage() {
  const admin = await getAdminOrRedirect();
  const [overview, health, activity] = await Promise.all([
    getPlatformOverview(),
    getSystemHealth(),
    listAuditLogs({ take: 6 }),
  ]);

  const issues = health.filter((check) => check.status !== "ok").length;
  const kpis: Array<{
    label: string;
    value: number | null;
    suffix?: string;
    detail: string;
    icon: LucideIcon;
    href: string;
  }> = [
    {
      label: "Studios",
      value: overview.users.total,
      detail: `${overview.users.newThisWeek} new this week · ${overview.users.admins} admin${overview.users.admins === 1 ? "" : "s"}`,
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "Generations",
      value: overview.generations.total,
      detail: `${overview.generations.byStatus.PROCESSING + overview.generations.byStatus.QUEUED} in flight right now`,
      icon: Sparkles,
      href: "/admin/generations",
    },
    {
      label: "Success rate",
      value: overview.generations.successRate,
      suffix: "%",
      detail:
        overview.generations.successRate === null
          ? "No finished generations yet"
          : `${overview.generations.byStatus.FAILED} failed of ${overview.generations.byStatus.COMPLETED + overview.generations.byStatus.FAILED}`,
      icon: Activity,
      href: "/admin/generations?status=FAILED",
    },
    {
      label: "Catalogue",
      value: overview.catalogue.garments,
      detail: `garments · ${overview.catalogue.clients} client profile${overview.catalogue.clients === 1 ? "" : "s"}`,
      icon: Shirt,
      href: "/admin/users",
    },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="gradient-studio-dark bg-grain relative overflow-hidden rounded-3xl p-8 text-white shadow-editorial sm:p-10">
          <GradientBlob variant="violet" className="-top-20 -right-16 size-72 opacity-40" />
          <GradientBlob variant="coral" className="-bottom-24 left-1/3 size-64 opacity-20" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
                Control room &middot;{" "}
                {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <h1 className="mt-3 font-heading text-4xl leading-tight sm:text-5xl">
                Welcome back, <span className="italic">{admin.name.split(" ")[0]}.</span>
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/65">
                Every studio, generation and integration on Queens Closet — at a glance.
              </p>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur-md",
                issues === 0 ? "border-emerald-400/30 bg-emerald-400/10" : "border-[color:var(--qc-gold)]/40 bg-[color:var(--qc-gold)]/10"
              )}
            >
              <span className="relative flex size-2.5">
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                    issues === 0 ? "bg-emerald-400" : "bg-[color:var(--qc-gold)]"
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex size-2.5 rounded-full",
                    issues === 0 ? "bg-emerald-400" : "bg-[color:var(--qc-gold)]"
                  )}
                />
              </span>
              {issues === 0 ? "All systems normal" : `${issues} integration${issues === 1 ? "" : "s"} need attention`}
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Reveal key={kpi.label} delay={0.05 * i}>
            <Link
              href={kpi.href}
              className="group block h-full rounded-3xl border border-border/70 bg-card p-6 shadow-editorial transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--qc-magenta)]/30"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">{kpi.label}</p>
                <span className="flex size-9 items-center justify-center rounded-full gradient-purple-magenta text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <kpi.icon className="size-4" />
                </span>
              </div>
              <p className="mt-6 font-heading text-4xl leading-none">
                {kpi.value === null ? "—" : <AnimatedNumber value={kpi.value} suffix={kpi.suffix} />}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{kpi.detail}</p>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <Panel eyebrow="Usage" title="Generation volume" className="h-full">
            <GenerationTrendChart points={overview.trend} />
          </Panel>
        </Reveal>
        <Reveal delay={0.08}>
          <Panel
            eyebrow="Pipeline"
            title="Status mix"
            className="h-full"
            action={
              <Link href="/admin/generations" className="text-xs font-medium text-[color:var(--qc-magenta)] hover:underline">
                View all
              </Link>
            }
          >
            <StatusBreakdown counts={overview.generations.byStatus} />
          </Panel>
        </Reveal>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Reveal>
          <Panel eyebrow="Infrastructure" title="System health" className="h-full">
            <ul className="space-y-3">
              {health.map((check) => {
                const Icon = healthIcons[check.key] ?? Database;
                const tone = healthTone[check.status];
                return (
                  <li key={check.key} className="flex items-start gap-3 rounded-2xl border border-border/60 p-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-[color:var(--qc-purple)]">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center justify-between gap-2 text-sm font-medium">
                        {check.label}
                        <span className={cn("flex items-center gap-1 text-xs font-medium", tone.className)}>
                          <tone.icon className="size-3.5" />
                          {tone.label}
                        </span>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{check.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </Reveal>

        <Reveal delay={0.06}>
          <Panel
            eyebrow="Audit trail"
            title="Recent admin activity"
            className="h-full"
            action={
              <Link href="/admin/activity" className="text-xs font-medium text-[color:var(--qc-magenta)] hover:underline">
                View all
              </Link>
            }
          >
            {activity.items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                No admin actions yet. Role changes, suspensions and cancellations will be logged here.
              </p>
            ) : (
              <ol className="relative space-y-4 border-l border-border/70 pl-5">
                {activity.items.map((entry) => (
                  <li key={entry.id} className="relative">
                    <span className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full border-2 border-card gradient-purple-magenta" />
                    <p className="text-sm">{entry.summary}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entry.actor.name} &middot; {formatRelativeTime(entry.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </Reveal>

        <Reveal delay={0.12}>
          <Panel
            eyebrow="Growth"
            title="Newest studios"
            className="h-full"
            action={
              <Link href="/admin/users" className="text-xs font-medium text-[color:var(--qc-magenta)] hover:underline">
                Manage
              </Link>
            }
          >
            <ul className="space-y-3">
              {overview.newestUsers.map((user) => (
                <li key={user.id} className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full gradient-magenta-coral text-xs font-semibold text-white">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {user.name}
                      {user.role === "ADMIN" && (
                        <span className="ml-2 rounded-full bg-[color:var(--qc-lavender)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--qc-purple)] uppercase">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(user.createdAt)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}
