import { createSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  const baseURL = String(body.baseURL ?? "").trim();
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const sessionTimeoutMin = Number(body.sessionTimeoutMin ?? 0);

  if (!baseURL) {
    setResponseStatus(event, 400);
    return { ok: false, error: "请填写服务器地址" };
  }

  const auth =
    "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
  const base = baseURL.endsWith("/") ? baseURL : baseURL + "/";
  const target = new URL("v1/api/info".replace(/^\/+/, ""), base);

  const timeoutMs = Number(useRuntimeConfig().palProxyTimeout) || 30000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const r = await fetch(target.toString(), {
      method: "GET",
      headers: { Authorization: auth, Accept: "application/json" },
      signal: ctrl.signal,
    });

    if (r.status === 401) {
      setResponseStatus(event, 401);
      return {
        ok: false,
        reauth: true,
        error:
          "鉴权失败：用户名或密码错误（用户名通常为 admin，密码为服务器 AdminPassword），或未开启 REST API (RESTAPIEnabled=True)。",
      };
    }
    if (!r.ok) {
      setResponseStatus(event, r.status);
      return {
        ok: false,
        error: `服务器返回 HTTP ${r.status}（${target.host}${target.pathname}）`,
      };
    }

    const data = await r.json().catch(() => ({}));
    const s = createSession(baseURL, username, auth, sessionTimeoutMin);
    return {
      ok: true,
      sessionId: s.id,
      lastAuthAt: s.lastAuthAt,
      servername: data?.servername,
      version: data?.version,
    };
  } catch (e: any) {
    const aborted =
      e?.name === "AbortError" || e?.cause?.name === "AbortError";
    setResponseStatus(event, aborted ? 504 : 502);
    return {
      ok: false,
      error: aborted
        ? `连接 ${target.host}${target.pathname} 超时（${timeoutMs / 1000}s 内无响应）`
        : `无法连接 ${target.host}${target.pathname}${e?.message ? `（${e.message}）` : ""}`,
    };
  } finally {
    clearTimeout(timer);
  }
});
