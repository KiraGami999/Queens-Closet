import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { NavUser } from "@/components/dashboard/nav-user";
import { getAdminOrRedirect } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Admin console — Queens Closet",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminOrRedirect();

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:px-10">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex flex-col leading-none">
              <span className="font-heading text-sm tracking-[0.16em] sm:text-base">QUEENS</span>
              <span className="font-heading text-sm tracking-[0.16em] text-gradient-purple-magenta sm:text-base">
                CLOSET
              </span>
            </span>
            <span className="rounded-full border border-[color:var(--qc-magenta)]/30 bg-[color:var(--qc-lavender)]/50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-[color:var(--qc-purple)] uppercase">
              Admin
            </span>
          </Link>

          <AdminNav className="hidden lg:flex" />

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <ArrowLeft className="size-3.5" />
              Studio
            </Link>
            <NavUser user={{ name: admin.name, email: admin.email }} isAdmin />
          </div>
        </div>
        <div className="overflow-x-auto px-4 pb-3 lg:hidden">
          <AdminNav className="w-max" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-16 sm:px-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
