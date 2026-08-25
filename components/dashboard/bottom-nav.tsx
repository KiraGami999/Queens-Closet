"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/components/dashboard/nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-2">
        {navItems.map((item) => {
          const isActive =
            item.url === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.url);
          return (
            <li key={item.url} className="flex-1">
              <Link
                href={item.url}
                className="flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-medium"
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-colors",
                    isActive
                      ? "gradient-purple-magenta text-primary-foreground shadow-editorial"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="size-[18px]" />
                </span>
                <span className={cn(isActive ? "text-foreground" : "text-muted-foreground")}>
                  {item.title === "Try-On Studio" ? "Try-On" : item.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
