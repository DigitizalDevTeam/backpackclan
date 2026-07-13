export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
}

export function emptyPaginationMeta(perPage = 12): PaginationMeta {
  return {
    currentPage: 1,
    lastPage: 1,
    perPage,
    total: 0,
    from: null,
    to: null,
  };
}

export function paginateArray<T>(
  items: T[],
  page = 1,
  perPage = 12
): { items: T[]; meta: PaginationMeta } {
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage) || 1);
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * perPage;
  const slice = items.slice(start, start + perPage);

  return {
    items: slice,
    meta: {
      currentPage,
      lastPage,
      perPage,
      total,
      from: slice.length ? start + 1 : null,
      to: slice.length ? start + slice.length : null,
    },
  };
}

export function buildPageHref(
  pathname: string,
  params: URLSearchParams,
  page: number
): string {
  const next = new URLSearchParams(params.toString());
  if (page <= 1) next.delete("page");
  else next.set("page", String(page));
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
