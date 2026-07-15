import { destroySession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  destroySession(body?.sessionId);
  return { ok: true };
});
