import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

function buildHref(page: number, params: Record<string, string>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `?${query}` : "?";
}

export function AdminPagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const linkClass =
    "flex items-center gap-1 rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={buildHref(page - 1, params)}
          aria-disabled={page <= 1}
          className={cn(linkClass, page <= 1 && "pointer-events-none opacity-40")}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Link>
        <Link
          href={buildHref(page + 1, params)}
          aria-disabled={page >= totalPages}
          className={cn(linkClass, page >= totalPages && "pointer-events-none opacity-40")}
        >
          Next
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </nav>
  );
}
