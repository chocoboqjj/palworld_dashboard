export const fmt = (n: unknown, d = 0): string => {
  if (n == null || (typeof n === "number" && isNaN(n))) return "—";
  return Number(n).toFixed(d);
};

export function humanUptime(sec?: number): string {
  if (sec == null || isNaN(sec)) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d}天 ${h}时`;
  if (h > 0) return `${h}时 ${m}分`;
  return `${m}分 ${s}秒`;
}

export function pushSample(arr: number[], v: number | undefined, max = 60): number[] {
  if (v == null || isNaN(v)) return arr;
  const next = [...arr, v];
  if (next.length > max) next.shift();
  return next;
}
