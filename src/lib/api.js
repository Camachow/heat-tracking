const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function api(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || res.statusText;
    throw new Error(msg);
  }
  return data;
}
