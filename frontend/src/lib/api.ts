const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export function getAccessToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem("arena_access_token");
}

export function saveAccessToken(token: string) {
  window.localStorage.setItem("arena_access_token", token);
  window.dispatchEvent(new Event("utms:auth-change"));
}

export function clearAccessToken() {
  window.localStorage.removeItem("arena_access_token");
  if (typeof window !== "undefined") window.dispatchEvent(new Event("utms:auth-change"));
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_ORIGIN}/api${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new Error(`Cannot connect to the backend API at ${API_ORIGIN}. Start the backend with npm run dev:backend. If it exits at startup, start Neo4j and check the root .env connection settings.`);
  }
  const payload = await response.json().catch(() => ({})) as { message?: string | string[] };
  if (!response.ok) {
    const message = Array.isArray(payload.message) ? payload.message.join(" ") : payload.message;
    if (response.status === 401) clearAccessToken();
    throw new Error(message || `Request failed (${response.status}).`);
  }
  return payload as T;
}

export function jsonBody(value: unknown) {
  return JSON.stringify(value);
}

export async function getDashboardPath(createSport = "") {
  if (createSport === "cricket" || createSport === "high-jump") return `/profile?createSport=${createSport}`;
  try {
    const access = await api<{ organizations: { id: string; role: string }[]; tournaments?: { id: string }[] }>("/auth/me");
    const manageable = access.organizations.filter((organization) => ["OWNER", "ADMIN"].includes(organization.role.toUpperCase()));
    if (manageable.length === 1) return `/organizations/${manageable[0].id}`;
    if (manageable.length > 1) return "/profile";
    if (access.tournaments?.length === 1) return `/tournaments/${access.tournaments[0].id}`;
  } catch {
    // The profile page handles expired sessions and displays API errors.
  }
  return "/profile";
}
