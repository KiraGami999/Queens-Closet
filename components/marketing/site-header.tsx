import Link from "next/link";

import { Button } from "@/components/ui/button";

const links = [
  { label: "The Studio", href: "#studio" },
  { label: "The Closet", href: "#closet" },
  { label: "Muses", href: "#muses" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
      <Link href="/" className="flex flex-col leading-none">
        <span className="font-heading text-lg tracking-[0.18em] text-foreground">
          QUEENS
        </span>
        <span className="font-heading text-lg tracking-[0.18em] text-gradient-purple-magenta">
          CLOSET
        </span>
      </Link>

      <nav className="hidden items-center gap-9 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
        >
          Sign in
        </Link>
        <Button
          render={<Link href="/register" />}
          className="gradient-purple-magenta rounded-full border-0 px-5 text-primary-foreground shadow-editorial hover:opacity-90"
        >
          Open Studio
        </Button>
      </div>
    </header>
  );
}
