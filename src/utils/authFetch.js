export async function postAuthJson(path, body) {
  let res;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Could not reach the API. In a separate terminal run: npm run server (port 3001). Or use npm run dev:all for both Vite and the API."
    );
  }

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "The API returned a non-JSON response. Restart the backend so it includes auth routes: stop the old process, then run npm run server again."
    );
  }

  if (!res.ok) {
    if (
      res.status === 404 ||
      text.includes("Cannot POST") ||
      text.includes("<!DOCTYPE")
    ) {
      throw new Error(
        "Registration/login API is not available. Your Node server is probably an old build: stop it (Ctrl+C), then run npm run server again."
      );
    }
    throw new Error(
      data.error || data.detail || `Request failed (${res.status}).`
    );
  }

  return data;
}
