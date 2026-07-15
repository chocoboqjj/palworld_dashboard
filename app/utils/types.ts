export interface ServerInfo {
  version?: string;
  servername?: string;
  description?: string;
  worldguid?: string;
}

export interface Metrics {
  serverfps?: number;
  currentplayernum?: number;
  serverframetime?: number;
  maxplayernum?: number;
  uptime?: number;
  basecampnum?: number;
  days?: number;
}

export interface Player {
  name?: string;
  accountName?: string;
  playerId?: string;
  userId?: string;
  iP?: string;
  ping?: number;
  location_x?: number;
  location_y?: number;
  level?: number;
}

export interface ConnConfig {
  baseURL: string;
  username: string;
  password?: string;
  ip?: string;
  port?: string;
  sessionTimeoutMin?: number;
  lastAuthAt?: number;
}

export function parseBaseURL(baseURL: string): { ip: string; port: string } {
  if (!baseURL) return { ip: "", port: "" };
  let url: URL | null = null;
  try {
    url = new URL(baseURL);
  } catch {
    try {
      url = new URL("http://" + baseURL);
    } catch {
      return { ip: baseURL, port: "" };
    }
  }
  const ip = url.hostname;
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  return { ip, port };
}

export function buildBaseURL(ip: string, port: string): string {
  const host = ip.trim().replace(/^https?:\/\//, "");
  if (!host) return "";
  const p = port.trim();
  return `http://${host}${p ? ":" + p : ""}`;
}
