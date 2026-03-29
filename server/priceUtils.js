
export function parsePriceInput(raw) {
  if (raw == null || raw === "") return NaN;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const s = String(raw).trim().replace(/[^\d.,-]/g, "").replace(",", ".");
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : NaN;
}

export function normalizeProductPriceForDb(input) {
  const n = parsePriceInput(input);
  if (!Number.isFinite(n) || n < 0) return null;
  return n.toFixed(2);
}
