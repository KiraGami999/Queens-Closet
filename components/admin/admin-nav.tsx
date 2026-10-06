"use client";

import { Activity, Gauge, Sparkles, Users } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const adminNavItems = [
  { title: "Overview", url: "/admin", icon: Gauge },
  { title: "Studios", url: "/admin/users", icon: Users },
  { title: "Generations", url: "/admin/generations", icon: Sparkles },
  { title: "Activity", url: "/admin/activity", icon: Activity },
] as const;

export function AdminNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1 rounded-full border border-border/70 bg-card/70 p-1", className)}>
      {adminNavItems.map((item) => {
        const isActive = item.url === "/admin" ? pathname === "/admin" : pathname.startsWith(item.url);
        return (
          <Link
            key={item.url}
            href={item.url}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="admin-nav-pill"
                className="absolute inset-0 rounded-full gradient-purple-magenta shadow-editorial"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <item.icon className="relative size-3.5" />
            <span className="relative">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
