const API_BASE = import.meta.env.VITE_API_URL || "";

function getToken(): string | null {
  try {
    const stored = localStorage.getItem("admin_auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.token || null;
    }
  } catch { /* ignore */ }
  return null;
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

export async function apiClient<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const normalizedPath = path.startsWith("/api/") ? path.replace(/^\/api/, "") : path;
  const res = await fetch(`${API_BASE}${normalizedPath}`, { ...options, headers });

  if (!res.ok) {
    let detail = "An error occurred";
    try {
      const err = await res.json();
      detail = err.detail || err.message || detail;
    } catch { /* ignore */ }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  const json = await res.json();
  return (json && typeof json === "object" && "data" in json && json.data !== undefined
    ? json.data
    : json) as T;
}
