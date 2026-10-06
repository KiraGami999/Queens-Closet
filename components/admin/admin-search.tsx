"use client";

import { Loader2, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";

/** Debounced search box that syncs to the `?q=` param so results are
 * filtered server-side and shareable by URL. */
export function AdminSearch({ initialQuery, placeholder }: { initialQuery: string; placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (query === initialQuery) return;
    const id = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      startTransition(() => router.replace(params.size ? `${pathname}?${params}` : pathname));
    }, 300);
    return () => clearTimeout(id);
  }, [query, initialQuery, pathname, router]);

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 rounded-full bg-card pr-9 pl-10"
      />
      {isPending && (
        <Loader2 className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
