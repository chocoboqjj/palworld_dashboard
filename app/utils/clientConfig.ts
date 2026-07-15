const KEY = "palworld_session_v1";

export interface BrowserSession {
  sessionId: string;
  baseURL: string;
  username: string;
  sessionTimeoutMin: number;
  lastAuthAt: number;
}

export function loadSession(): BrowserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as BrowserSession;
    if (!s.sessionId || !s.baseURL) return null;
    return s;
  } catch {
    return null;
  }
}

export function saveSession(s: BrowserSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
