import { Sparkles } from "lucide-react";
import Link from "next/link";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { CancelGenerationButton } from "@/components/admin/cancel-generation-button";
import { TryOnStatusBadge, tryOnStatusMeta } from "@/components/admin/status-badge";
import { Reveal } from "@/components/motion/reveal";
import { getAdminOrRedirect } from "@/lib/auth/admin-guard";
import { listGenerationsForAdmin } from "@/lib/services/admin-service";
import { cn } from "@/lib/utils";
import { formatDuration, formatRelativeTime } from "@/lib/utils/format";
import { tryOnStatusSchema, type TryOnStatusValue } from "@/lib/validations/admin";
import { garmentCategoryLabels } from "@/lib/validations/garment";

function readParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function AdminGenerationsPage({ searchParams }: PageProps<"/admin/generations">) {
  await getAdminOrRedirect();
  const params = await searchParams;
  const parsedStatus = tryOnStatusSchema.safeParse(readParam(params.status));
  const status: TryOnStatusValue | undefined = parsedStatus.success ? parsedStatus.data : undefined;
  const page = Number(readParam(params.page)) || 1;

  const { items, total, totalPages } = await listGenerationsForAdmin({ status, page });
  const filters: Array<TryOnStatusValue | undefined> = [undefined, ...tryOnStatusSchema.options];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-[0.2em] text-[color:var(--qc-magenta)] uppercase">Generations</p>
        <h1 className="mt-2 font-heading text-3xl sm:text-4xl">AI pipeline monitor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} generation{total === 1 ? "" : "s"}
          {status && ` · ${tryOnStatusMeta[status].label.toLowerCase()}`}. Stuck jobs can be cancelled so they stop
          counting against a studio&rsquo;s limit.
        </p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {filters.map((value) => {
          const active = value === status;
          return (
            <Link
              key={value ?? "ALL"}
              href={value ? `/admin/generations?status=${value}` : "/admin/generations"}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-transparent gradient-purple-magenta text-primary-foreground shadow-editorial"
                  : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {value ? tryOnStatusMeta[value].label : "All"}
            </Link>
          );
        })}
      </div>

      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-editorial">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <span className="mb-4 flex size-14 items-center justify-center rounded-full gradient-lavender-purple text-white shadow-editorial">
                <Sparkles className="size-5" />
              </span>
              <p className="font-heading text-xl italic">Nothing here yet.</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Generations from every studio will stream in here as soon as looks are created.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-left text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 font-medium">Studio</th>
                    <th className="px-4 py-4 font-medium">Garment</th>
                    <th className="px-4 py-4 font-medium">Provider</th>
                    <th className="px-4 py-4 font-medium">Duration</th>
                    <th className="px-4 py-4 font-medium">Started</th>
                    <th className="px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((session) => (
                    <tr key={session.id} className="border-b border-border/50 align-top last:border-0 hover:bg-secondary/40">
                      <td className="px-6 py-4">
                        <TryOnStatusBadge status={session.status} />
                        {session.errorMessage && (
                          <p className="mt-2 max-w-56 text-xs text-muted-foreground">
                            <span className="font-mono text-[10px] text-destructive">{session.errorCode}</span>
                            <br />
                            {session.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p>{session.garment.name}</p>
                        <p className="text-xs text-muted-foreground">{garmentCategoryLabels[session.garment.category]}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-xs">{session.providerName}</span>
                      </td>
                      <td className="px-4 py-4 tabular-nums text-muted-foreground">
                        {session.completedAt ? formatDuration(session.createdAt, session.completedAt) : "—"}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{formatRelativeTime(session.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        {(session.status === "QUEUED" || session.status === "PROCESSING") && (
                          <CancelGenerationButton sessionId={session.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Reveal>

      <AdminPagination page={page} totalPages={totalPages} params={{ status: status ?? "" }} />
    </div>
  );
}
