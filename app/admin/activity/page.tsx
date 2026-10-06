import { PauseCircle, PlayCircle, ShieldCheck, ShieldOff, XCircle, type LucideIcon } from "lucide-react";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { Reveal } from "@/components/motion/reveal";
import { getAdminOrRedirect } from "@/lib/auth/admin-guard";
import { listAuditLogs } from "@/lib/services/admin-service";
import { formatRelativeTime } from "@/lib/utils/format";

const actionIcons: Record<string, LucideIcon> = {
  "user.promoted": ShieldCheck,
  "user.demoted": ShieldOff,
  "user.suspended": PauseCircle,
  "user.reactivated": PlayCircle,
  "generation.cancelled": XCircle,
};

function readParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function AdminActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  await getAdminOrRedirect();
  const params = await searchParams;
  const page = Number(readParam(params.page)) || 1;
  const { items, total, totalPages } = await listAuditLogs({ page });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-[0.2em] text-[color:var(--qc-magenta)] uppercase">Audit trail</p>
        <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Admin activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          An immutable record of every privileged action — {total} entr{total === 1 ? "y" : "ies"} so far.
        </p>
      </div>

      <Reveal>
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-editorial sm:p-8">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nothing logged yet. Promote, suspend or cancel from the other tabs and it will appear here.
            </p>
          ) : (
            <ol className="relative space-y-6 border-l border-border/70 pl-8">
              {items.map((entry) => {
                const Icon = actionIcons[entry.action] ?? ShieldCheck;
                return (
                  <li key={entry.id} className="relative">
                    <span className="absolute top-0 -left-[2.85rem] flex size-8 items-center justify-center rounded-full border-4 border-card gradient-purple-magenta text-white">
                      <Icon className="size-3.5" />
                    </span>
                    <p className="text-sm font-medium">{entry.summary}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      by {entry.actor.name} ({entry.actor.email}) &middot;{" "}
                      <time dateTime={entry.createdAt.toISOString()} title={entry.createdAt.toLocaleString("en-GB")}>
                        {formatRelativeTime(entry.createdAt)}
                      </time>
                      <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">{entry.action}</span>
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </Reveal>

      <AdminPagination page={page} totalPages={totalPages} params={{}} />
    </div>
  );
}
