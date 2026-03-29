export const ADMIN_ORDER_STATUSES = ["pending", "confirmed", "completed"];

export function normalizeAdminStatus(value) {
  const s = typeof value === "string" ? value.trim().toLowerCase() : "";
  return ADMIN_ORDER_STATUSES.includes(s) ? s : null;
}
