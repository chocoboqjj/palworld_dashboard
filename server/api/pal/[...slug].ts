import { getPalSession } from "../../utils/session";

function resolveSuffix(slug?: string): string {
  // slug 是 catch-all 路径段，如 "info" 或 "players"
  return "/v1/api/" + (slug ?? "").replace(/^\/+/, "");
}

async function proxyOnce(
  event: any,
  suffix: string,
  session: ReturnType<typeof getPalSession>,
) {
  const base = session!.baseURL.endsWith("/")
    ? session!.baseURL
    : session!.baseURL + "/";
  const target = new URL(suffix.replace(/^\/+/, ""), base);

  const headers: Record<string, string> = {
    Authorization: session!.authHeader,
    Accept: "application/json",
  };

  // 读取请求体（非 GET/HEAD 时）
  const method = event.method || "GET";
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      const json = await readBody(event);
      if (json) {
        body = JSON.stringify(json);
        headers["Content-Type"] = "application/json";
      }
    } catch {
      /* no body */
    }
  }

  const config = useRuntimeConfig();
  const timeoutMs = Number(config.palProxyTimeout) || 30000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const upstream = await fetch(target.toString(), {
      method,
      headers,
      body,
      signal: ctrl.signal,
    });
    const text = await upstream.text();
    let payload: any = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { raw: text };
      }
    }
    return {
      status: upstream.status,
      payload,
      host: target.host,
      pathname: target.pathname,
    };
  } finally {
    clearTimeout(timer);
  }
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const session = getPalSession(getHeader(event, "x-pal-session"));

  if (!session) {
    setResponseStatus(event, 401);
    return { error: "会话已失效，请重新连接。", reauth: true };
  }

  const suffix = resolveSuffix(slug);
  const timeoutMs =
    Number(useRuntimeConfig().palProxyTimeout) || 30000;

  try {
    const result = await proxyOnce(event, suffix, session);
    setResponseStatus(event, result.status);
    return result.payload ?? {
      ok: result.status >= 200 && result.status < 300,
      status: result.status,
    };
  } catch (e: any) {
    const aborted =
      e?.name === "AbortError" ||
      e?.cause?.name === "AbortError" ||
      e?.code === "ABORT_ERR";
    const base =
      (session.baseURL.endsWith("/")
        ? session.baseURL
        : session.baseURL + "/") + "v1/api/";
    const endpoint = base + (slug ?? "");
    const detail = aborted
      ? `请求 ${endpoint} 在 ${timeoutMs / 1000}s 内未响应（端点数据量较大或服务器负载较高）。`
      : `无法连接 ${endpoint} —— ${e?.message ?? e}`;
    setResponseStatus(event, aborted ? 504 : 502);
    return {
      error: aborted ? "服务器响应超时" : "无法连接游戏服务器",
      detail,
    };
  }
});
