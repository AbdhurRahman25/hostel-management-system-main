
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("hostel_token");
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const response = await fetch(url, {...options, headers});
  if (response.status === 401 && !location.pathname.startsWith("/login")) {
    localStorage.removeItem("hostel_token");
    localStorage.removeItem("hostel_user");
    location.href="/login";
  }
  return response;
}
