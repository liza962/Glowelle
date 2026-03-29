export function parsePriceInput(raw) {
  if (raw == null || raw === "") return NaN;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const s = String(raw).trim().replace(/[^\d.,-]/g, "").replace(",", ".");
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : NaN;
}

export function formatPriceEUR(raw) {
  if (raw == null || raw === "") return "—";
  const n = parsePriceInput(raw);
  if (!Number.isFinite(n)) return String(raw);
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function priceForNumberInput(raw) {
  const n = parsePriceInput(raw);
  if (!Number.isFinite(n)) return "";
  return n;
}
