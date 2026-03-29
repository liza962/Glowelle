export const ADMIN_PAGE_SIZE = 10;

export function filterBySearch(items, query, getSearchableStrings) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    getSearchableStrings(item).some((s) =>
      String(s ?? "")
        .toLowerCase()
        .includes(q)
    )
  );
}

export function computeTotalPages(length, pageSize) {
  return Math.max(1, Math.ceil(length / pageSize));
}

export function slicePage(items, page, pageSize) {
  const totalPages = computeTotalPages(items.length, pageSize);
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * pageSize;
  return {
    pageItems: items.slice(start, start + pageSize),
    totalPages,
    page: p,
    startIndex: items.length === 0 ? 0 : start,
    endIndex: items.length === 0 ? 0 : Math.min(start + pageSize, items.length),
  };
}
