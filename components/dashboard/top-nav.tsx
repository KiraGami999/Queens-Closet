"use client";

import { ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/components/dashboard/nav-items";
import { NavUser } from "@/components/dashboard/nav-user";
import { cn } from "@/lib/utils";

export function TopNav({
  user,
  isAdmin,
}: {
  user: { name: string; email: string; image?: string | null };
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-15 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:h-16 md:px-10">
        <Link href="/dashboard" className="group flex flex-col leading-none">
          <span className="font-heading text-sm tracking-[0.16em] transition-[letter-spacing] duration-500 group-hover:tracking-[0.24em] sm:text-base">
            QUEENS
          </span>
          <span className="font-heading text-sm tracking-[0.16em] text-gradient-purple-magenta transition-[letter-spacing] duration-500 group-hover:tracking-[0.24em] sm:text-base">
            CLOSET
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/70 p-1 lg:flex">
          {navItems.map((item) => {
            const isActive =
              item.url === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="top-nav-pill"
                    className="absolute inset-0 rounded-full gradient-purple-magenta shadow-editorial"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[color:var(--qc-magenta)]/40 hover:text-foreground sm:flex"
            >
              <ShieldCheck className="size-3.5 text-[color:var(--qc-magenta)]" />
              Admin
            </Link>
          )}
          <NavUser user={user} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
