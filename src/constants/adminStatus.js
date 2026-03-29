/** Must match server `adminStatus.js` ADMIN_ORDER_STATUSES */
export const ADMIN_STATUSES = ["pending", "confirmed", "completed"];

export function statusLabel(value) {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function statusBadgeBg(status) {
  const s = String(status ?? "pending").toLowerCase();
  if (s === "confirmed") return "primary";
  if (s === "completed") return "success";
  return "warning";
}
