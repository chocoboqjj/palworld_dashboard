import { randomUUID } from "crypto";

export interface PalSession {
  id: string;
  baseURL: string;
  authHeader: string;
  username: string;
  sessionTimeoutMin: number;
  lastAuthAt: number;
}

const g = globalThis as unknown as {
  __palSessions?: Map<string, PalSession>;
};
const sessions: Map<string, PalSession> =
  g.__palSessions ?? (g.__palSessions = new Map());

export function createSession(
  baseURL: string,
  username: string,
  authHeader: string,
  sessionTimeoutMin: number,
): PalSession {
  const id = randomUUID();
  const s: PalSession = {
    id,
    baseURL,
    authHeader,
    username,
    sessionTimeoutMin,
    lastAuthAt: Date.now(),
  };
  sessions.set(id, s);
  return s;
}

export function getPalSession(id?: string | null): PalSession | null {
  if (!id) return null;
  const s = sessions.get(id);
  if (!s) return null;
  if (
    s.sessionTimeoutMin > 0 &&
    Date.now() - s.lastAuthAt > s.sessionTimeoutMin * 60000
  ) {
    sessions.delete(id);
    return null;
  }
  return s;
}

export function touchSession(id?: string | null): void {
  const s = id ? sessions.get(id) : null;
  if (s) s.lastAuthAt = Date.now();
}

export function destroySession(id?: string | null): void {
  if (id) sessions.delete(id);
}
