"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/components/dashboard/nav-items";
import { NavUser } from "@/components/dashboard/nav-user";
import { cn } from "@/lib/utils";

export function TopNav({
  user,
}: {
  user: { name: string; email: string; image?: string | null };
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-10">
        <Link href="/dashboard" className="flex flex-col leading-none">
          <span className="font-heading text-base tracking-[0.16em]">QUEENS</span>
          <span className="font-heading text-base tracking-[0.16em] text-gradient-purple-magenta">
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
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "gradient-purple-magenta text-primary-foreground shadow-editorial"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <NavUser user={user} />
      </div>
    </header>
  );
}
