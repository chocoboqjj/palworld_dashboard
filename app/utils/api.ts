import { loadSession } from "./clientConfig";

export async function apiFetch(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body: unknown = null,
): Promise<any> {
  const session = loadSession();
  const headers: Record<string, string> = {};
  if (session?.sessionId) headers["x-pal-session"] = session.sessionId;
  if (body !== null) headers["Content-Type"] = "application/json";

  const opt: RequestInit = { method, headers };
  if (body !== null) opt.body = JSON.stringify(body);

  const res = await fetch(`/api/pal${path}`, opt);
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    const err: any = new Error(
      data?.error || data?.detail || data?.message || `HTTP ${res.status}`,
    );
    if (res.status === 401 && data?.reauth) err.reauth = true;
    throw err;
  }
  return data;
}

export interface TestResult {
  ok: boolean;
  status?: number;
  error?: string;
  reauth?: boolean;
  servername?: string;
  version?: string;
}

export async function testConnection(cfg: {
  baseURL: string;
  username: string;
  password?: string;
}): Promise<TestResult> {
  const res = await fetch("/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cfg),
  });
  return res.json();
}

export async function login(cfg: {
  baseURL: string;
  username: string;
  password?: string;
  sessionTimeoutMin?: number;
}): Promise<{
  sessionId: string;
  lastAuthAt: number;
  servername?: string;
  version?: string;
}> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cfg),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.sessionId) {
    const err: any = new Error(data?.error || `HTTP ${res.status}`);
    if (res.status === 401 && data?.reauth) err.reauth = true;
    throw err;
  }
  return data;
}

export async function logout(sessionId: string): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  }).catch(() => {});
}
