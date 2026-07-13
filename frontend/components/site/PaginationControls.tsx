import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/lib/site/pagination";
import { buildPageHref } from "@/lib/site/pagination";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  meta: PaginationMeta;
  pathname: string;
  searchParams: Record<string, string | undefined>;
  className?: string;
}

export function PaginationControls({
  meta,
  pathname,
  searchParams,
  className,
}: PaginationControlsProps) {
  if (meta.lastPage <= 1) return null;

  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });

  const pages = visiblePages(meta.currentPage, meta.lastPage);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-center gap-2 pt-10", className)}
    >
      <PaginationLink
        href={buildPageHref(pathname, params, meta.currentPage - 1)}
        disabled={meta.currentPage <= 1}
        label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Prev</span>
      </PaginationLink>

      {pages.map((page, i) =>
        page === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildPageHref(pathname, params, page)}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
              page === meta.currentPage
                ? "border-[#F58220] bg-[#FFD200] text-black"
                : "border-slate-200 bg-white text-slate-700 hover:border-[#F58220]/40 hover:text-[#F58220]"
            )}
            aria-current={page === meta.currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        )
      )}

      <PaginationLink
        href={buildPageHref(pathname, params, meta.currentPage + 1)}
        disabled={meta.currentPage >= meta.lastPage}
        label="Next"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-100 px-3 text-sm text-slate-300"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-[#F58220]/40 hover:text-[#F58220]"
    >
      {children}
    </Link>
  );
}

function visiblePages(current: number, last: number): Array<number | "…"> {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, last, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
  const result: Array<number | "…"> = [];

  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i];
    if (i > 0 && page - sorted[i - 1] > 1) result.push("…");
    result.push(page);
  }

  return result;
}
