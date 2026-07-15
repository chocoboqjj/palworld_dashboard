export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  const baseURL = String(body.baseURL ?? "").trim();
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const prefix = "/v1/api";

  if (!baseURL) {
    setResponseStatus(event, 400);
    return { ok: false, status: 0, error: "请填写服务器地址" };
  }

  const base = baseURL.endsWith("/") ? baseURL : baseURL + "/";
  const targetFor = (suffix: string) =>
    new URL(suffix.replace(/^\/+/, ""), base);

  const auth = Buffer.from(`${username}:${password}`).toString("base64");
  const headers = { Authorization: `Basic ${auth}`, Accept: "application/json" };

  const timeoutMs = Number(useRuntimeConfig().palProxyTimeout) || 30000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  const probe = async (suffix: string) => {
    const target = targetFor(suffix);
    const r = await fetch(target.toString(), {
      method: "GET",
      headers,
      signal: ctrl.signal,
    });
    return { r, host: target.host, pathname: target.pathname };
  };

  try {
    const { r, host, pathname } = await probe(prefix + "/info");
    clearTimeout(timer);

    if (r.status === 401) {
      setResponseStatus(event, 401);
      return {
        ok: false,
        status: 401,
        error:
          "鉴权失败：用户名或密码错误（用户名通常为 admin，密码为服务器 AdminPassword），或未开启 REST API (RESTAPIEnabled=True)。",
      };
    }
    if (!r.ok) {
      setResponseStatus(event, r.status);
      return {
        ok: false,
        status: r.status,
        error: `服务器返回 HTTP ${r.status}（${host}${pathname}）`,
      };
    }
    let data: any = null;
    try {
      data = await r.json();
    } catch {
      /* ignore */
    }
    return {
      ok: true,
      status: r.status,
      servername: data?.servername,
      version: data?.version,
    };
  } catch (e: any) {
    clearTimeout(timer);
    const aborted =
      e?.name === "AbortError" || e?.cause?.name === "AbortError";
    const cause =
      e?.cause?.message || e?.cause?.code || (e?.cause ? String(e.cause) : "");
    const endpoint = `${base.replace(/\/$/, "")}/v1/api/info`;
    setResponseStatus(event, aborted ? 504 : 502);
    return {
      ok: false,
      status: 0,
      error: aborted
        ? `连接 ${endpoint} 超时（${timeoutMs / 1000}s 内无响应）`
        : `无法连接 ${endpoint}${cause ? `（${cause}）` : ""}`,
    };
  }
});
