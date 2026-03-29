export async function apiJson(path, options = {}) {
  const { token, ...rest } = options;
  const headers = { "Content-Type": "application/json", ...rest.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(path, { ...rest, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || data.detail || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}
