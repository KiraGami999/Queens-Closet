import { ShieldCheck } from "lucide-react";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSearch } from "@/components/admin/admin-search";
import { UserActions } from "@/components/admin/user-actions";
import { Reveal } from "@/components/motion/reveal";
import { getAdminOrRedirect } from "@/lib/auth/admin-guard";
import { listUsersForAdmin } from "@/lib/services/admin-service";
import { cn } from "@/lib/utils";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";

function readParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const admin = await getAdminOrRedirect();
  const params = await searchParams;
  const query = readParam(params.q);
  const page = Number(readParam(params.page)) || 1;

  const { items, total, totalPages } = await listUsersForAdmin({ search: query, page });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-[color:var(--qc-magenta)] uppercase">Studios</p>
          <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Every account on the platform</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} account{total === 1 ? "" : "s"}
            {query && ` matching “${query}”`}. Client photos stay private to each studio.
          </p>
        </div>
        <AdminSearch initialQuery={query} placeholder="Search by name or email" />
      </div>

      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-editorial">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  <th className="px-6 py-4 font-medium">Studio</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 text-right font-medium">Garments</th>
                  <th className="px-4 py-4 text-right font-medium">Clients</th>
                  <th className="px-4 py-4 text-right font-medium">Looks</th>
                  <th className="px-4 py-4 font-medium">Last sign-in</th>
                  <th className="px-4 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-muted-foreground">
                      No accounts match that search.
                    </td>
                  </tr>
                )}
                {items.map((user) => (
                  <tr
                    key={user.id}
                    className={cn(
                      "border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/40",
                      user.suspendedAt && "opacity-60"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full gradient-purple-magenta text-xs font-semibold text-white">
                          {user.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate font-medium">
                            {user.name}
                            {user.role === "ADMIN" && (
                              <ShieldCheck className="size-3.5 text-[color:var(--qc-magenta)]" aria-label="Admin" />
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {user.suspendedAt ? (
                        <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                          Suspended
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">{user._count.garments}</td>
                    <td className="px-4 py-4 text-right tabular-nums">{user._count.clients}</td>
                    <td className="px-4 py-4 text-right tabular-nums">{user._count.tryOnSessions}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "—"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <UserActions
                        isSelf={user.id === admin.id}
                        user={{
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          role: user.role,
                          isSuspended: user.suspendedAt !== null,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <AdminPagination page={page} totalPages={totalPages} params={{ q: query }} />
    </div>
  );
}
