<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-30 border-b border-white/[0.06] backdrop-blur-2xl" style="background: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(10,10,26,0.75) 100%);">
      <div class="max-w-[1280px] mx-auto px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center">
            <PawPrint class="h-5 w-5 text-accent-soft" />
          </div>
          <div>
            <h1 class="text-base font-bold leading-tight">幻兽帕鲁 监控面板</h1>
            <p class="text-xs text-white/30">Palworld Server Dashboard · REST API</p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <span
            :class="[
              'chip',
              connecting
                ? 'border-amber-400/20 bg-amber-400/8 text-amber-300'
                : connected
                  ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-300'
                  : 'border-rose-400/20 bg-rose-400/8 text-rose-300',
            ]"
          >
            <Loader2 v-if="connecting" class="h-3 w-3 animate-spin" />
            <span
              v-else
              :class="['h-2 w-2 rounded-full', connected ? 'bg-emerald-400' : 'bg-rose-400']"
            />
            {{ connecting ? "连接中" : connected ? "已连接" : "未连接" }}
          </span>

          <button v-if="configured" class="btn" @click="disconnect">断开</button>
          <button class="btn" @click="poll()"><RefreshCw class="h-4 w-4" /> 刷新</button>

          <label class="flex items-center gap-1.5 text-xs text-white/40 cursor-pointer select-none">
            <input v-model="autoRefresh" type="checkbox" class="accent-accent" />
            自动
          </label>

          <select v-model.number="intervalMs" class="input !w-auto !py-1.5">
            <option :value="1000">1 秒</option>
            <option :value="3000">3 秒</option>
            <option :value="5000">5 秒</option>
            <option :value="10000">10 秒</option>
            <option :value="30000">30 秒</option>
          </select>

          <button class="btn btn-primary" @click="openSettings">
            <SettingsIcon class="h-4 w-4" /> 连接设置
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-[1280px] mx-auto px-5 py-6 flex flex-col gap-6">
      <template v-if="configured">
        <!-- 服务器信息 -->
        <div v-if="info" class="card p-5 flex flex-wrap items-center gap-x-6 gap-y-2 animate-fade-in">
          <div class="min-w-[180px]">
            <div class="text-lg font-bold text-white/90 truncate">{{ info.servername || "未命名服务器" }}</div>
            <div class="text-xs text-white/40 mt-0.5">版本 {{ info.version || "未知" }}</div>
          </div>
          <div v-if="info.description" class="text-sm text-white/50 flex-1 min-w-[200px]">
            {{ info.description }}
          </div>
        </div>

        <!-- API 端点状态 -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-white/30">API</span>
          <span
            v-for="b in statusBars"
            :key="b.name"
            :class="[
              'chip',
              b.st === 'ok'
                ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-300'
                : b.st === 'err'
                  ? 'border-rose-400/20 bg-rose-400/8 text-rose-300'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/30',
            ]"
            :title="`/${b.name}: ${b.st === 'ok' ? 'OK' : b.st === 'err' ? 'FAIL' : 'IDLE'}`"
          >
            <span
              :class="['h-2 w-2 rounded-full', b.st === 'ok' ? 'bg-emerald-400' : b.st === 'err' ? 'bg-rose-400' : 'bg-white/20']"
            />
            /{{ b.name }}
          </span>
        </div>

        <OverviewCards :metrics="metrics" :info="info" />
        <TrendCharts :fps="history.fps" :players="history.players" />
        <MapView :players="players" />
        <PlayerTable :players="players" @kick="kick" @ban="ban" />
        <ServerActions
          @announce="announce" @save="saveWorld" @shutdown="shutdown"
          @stop="stopServer" @unban="unban"
        />
        <SettingsPanel :settings="settings" @load="loadSettings" />
      </template>

      <!-- 未连接 -->
      <div v-else class="card p-16 flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
        <div class="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <PawPrint class="h-8 w-8 text-white/15" />
        </div>
        <div class="text-base font-semibold text-white/60">尚未连接到服务器</div>
        <div class="text-sm text-white/30 max-w-sm">
          点击「连接设置」填写服务器地址与管理员密码即可开始监控。
        </div>
        <button class="btn btn-primary mt-2" @click="openSettings">
          <SettingsIcon class="h-4 w-4" /> 连接设置
        </button>
      </div>

      <p class="text-center text-xs text-white/15 py-2">
        Palworld REST API v1.0 · /info /metrics /players /settings · /announce /kick /ban /unban /save /shutdown /stop
      </p>
    </main>

    <SettingsModal
      :open="settingsOpen" :initial="cfgDraft" :require-password="reauth"
      @close="settingsOpen = false" @save="handleSaveConfig"
    />
    <ConfirmDialog
      :open="confirm !== null"
      :title="confirm?.title ?? ''" :text="confirm?.text ?? ''"
      :confirm-label="confirm?.confirmLabel" :danger="confirm?.danger"
      @confirm="onConfirmOk" @cancel="confirm = null"
    />
  </div>
</template>

<script setup lang="ts">
import { PawPrint, RefreshCw, Settings as SettingsIcon, Loader2 } from "lucide-vue-next";
import type { ConnConfig, Metrics, Player, ServerInfo } from "~/utils/types";
import { loadSession, saveSession, clearSession } from "~/utils/clientConfig";
import { pushSample } from "~/utils/format";
import { apiFetch, login, logout, testConnection, type TestResult } from "~/utils/api";

type History = { fps: number[]; players: number[]; frametime: number[]; uptime: number[] };
const EMPTY_HISTORY: History = { fps: [], players: [], frametime: [], uptime: [] };

interface ConfirmItem { title: string; text: string; confirmLabel?: string; danger?: boolean; onOk: () => void; }

const toast = useToast();
const configured = ref(false);
const connected = ref(false);
const connecting = ref(false);
const info = ref<ServerInfo | null>(null);
const metrics = ref<Metrics | null>(null);
const players = ref<Player[]>([]);
const settings = ref<Record<string, unknown> | null>(null);
const liveStatus = ref({ info: "idle", metrics: "idle", players: "idle" });
const settingsStatus = ref("idle");
const history = ref<History>({ ...EMPTY_HISTORY });
const autoRefresh = ref(true);
const intervalMs = ref(5000);
const settingsOpen = ref(false);
const reauth = ref(false);
const confirm = ref<ConfirmItem | null>(null);
const cfgDraft = ref<ConnConfig>({ baseURL: "", username: "admin", password: "", sessionTimeoutMin: 60 });

const statusBars = computed(() => [
  { name: "info", st: liveStatus.value.info },
  { name: "metrics", st: liveStatus.value.metrics },
  { name: "players", st: liveStatus.value.players },
  { name: "settings", st: settingsStatus.value },
]);

let expiryTimer: ReturnType<typeof setTimeout> | null = null;

function triggerReauth() {
  configured.value = false;
  reauth.value = true;
  settingsOpen.value = true;
  toast.show("会话已过期或失效，请重新输入密码", "err");
}

function armExpiry(lastAuthAt: number, timeoutMin: number) {
  if (expiryTimer) clearTimeout(expiryTimer);
  if (!timeoutMin || timeoutMin <= 0) return;
  const remain = lastAuthAt + timeoutMin * 60000 - Date.now();
  if (remain <= 0) { triggerReauth(); return; }
  expiryTimer = setTimeout(triggerReauth, remain);
}

async function poll() {
  try {
    const [infoR, metR, plR, setR] = await Promise.allSettled([
      apiFetch("/info"), apiFetch("/metrics"), apiFetch("/players"), apiFetch("/settings"),
    ]);
    let ok = false;
    if (infoR.status === "fulfilled") { info.value = infoR.value; ok = true; }
    if (metR.status === "fulfilled") {
      const m: Metrics = metR.value;
      metrics.value = m; ok = true;
      history.value = {
        fps: pushSample(history.value.fps, m.serverfps),
        players: pushSample(history.value.players, m.currentplayernum),
        frametime: pushSample(history.value.frametime, m.serverframetime),
        uptime: pushSample(history.value.uptime, m.uptime),
      };
    }
    if (plR.status === "fulfilled") players.value = plR.value.players ?? [];
    liveStatus.value = {
      info: infoR.status === "fulfilled" ? "ok" : "err",
      metrics: metR.status === "fulfilled" ? "ok" : "err",
      players: plR.status === "fulfilled" ? "ok" : "err",
    };
    settingsStatus.value = setR.status === "fulfilled" ? "ok" : "err";
    connected.value = ok;
    if (!ok && !settingsOpen.value) toast.show("连接服务器失败", "err");
    return ok;
  } catch (e: any) {
    connected.value = false;
    if (e?.reauth) triggerReauth();
    else toast.show(e?.message ?? "轮询出错", "err");
    return false;
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null;
watch([autoRefresh, configured, settingsOpen] as const, ([ar, cfg, so]) => {
  if (pollTimer) clearInterval(pollTimer);
  if (!ar || !cfg || so) return;
  poll();
  pollTimer = setInterval(poll, intervalMs.value);
});
watch(intervalMs, () => {
  if (!autoRefresh.value || !configured.value || settingsOpen.value) return;
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(poll, intervalMs.value);
});

onMounted(() => {
  const c = loadSession();
  if (!c) { settingsOpen.value = true; return; }
  const timeoutMin = c.sessionTimeoutMin ?? 0;
  const expired = Boolean(timeoutMin > 0 && c.lastAuthAt && Date.now() - c.lastAuthAt > timeoutMin * 60000);
  cfgDraft.value = { baseURL: c.baseURL, username: c.username, password: "", sessionTimeoutMin: timeoutMin };
  if (expired) {
    configured.value = false; reauth.value = true; settingsOpen.value = true;
    toast.show("会话已过期，请重新输入密码", "err");
  } else { configured.value = true; poll(); armExpiry(c.lastAuthAt ?? Date.now(), timeoutMin); }
});
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer); if (expiryTimer) clearTimeout(expiryTimer); });

function openSettings() {
  const c = loadSession();
  if (c) cfgDraft.value = { baseURL: c.baseURL, username: c.username || "admin", password: "", sessionTimeoutMin: c.sessionTimeoutMin ?? 60 };
  settingsOpen.value = true;
}

async function disconnect() {
  if (expiryTimer) clearTimeout(expiryTimer);
  const s = loadSession();
  if (s) await logout(s.sessionId).catch(() => {});
  clearSession();
  configured.value = false; connected.value = false; reauth.value = false;
  info.value = null; metrics.value = null; players.value = [];
  history.value = { ...EMPTY_HISTORY };
  liveStatus.value = { info: "idle", metrics: "idle", players: "idle" };
  settingsStatus.value = "idle";
  toast.show("已断开连接", "info");
}

async function handleSaveConfig(cfg: ConnConfig) {
  connecting.value = true;
  try {
    const res = await login({ baseURL: cfg.baseURL, username: cfg.username, password: cfg.password, sessionTimeoutMin: cfg.sessionTimeoutMin ?? 0 });
    saveSession({ sessionId: res.sessionId, baseURL: cfg.baseURL, username: cfg.username, sessionTimeoutMin: cfg.sessionTimeoutMin ?? 0, lastAuthAt: res.lastAuthAt });
    configured.value = true; reauth.value = false; settingsOpen.value = false;
    armExpiry(res.lastAuthAt, cfg.sessionTimeoutMin ?? 0);
    toast.show("已保存，正在连接…", "info");
    const ok = await poll();
    toast.show(ok ? "连接成功" : "已保存，但暂无法连接服务器", ok ? "ok" : "err");
  } catch (e: any) { toast.show(e?.message ?? "保存失败", "err"); }
  finally { connecting.value = false; }
}

function kick(userid: string) {
  confirm.value = { title: "踢出玩家", text: `确定要踢出用户 ${userid} 吗？`, danger: true,
    onOk: async () => { try { const r = await apiFetch("/kick", "POST", { userid }); toast.show(r.message || "已踢出", "ok"); poll(); } catch (e: any) { toast.show(e.message, "err"); } } };
}
function ban(userid: string) {
  confirm.value = { title: "封禁玩家", text: `确定要封禁用户 ${userid} 吗？`, danger: true,
    onOk: async () => { try { const r = await apiFetch("/ban", "POST", { userid }); toast.show(r.message || "已封禁", "ok"); poll(); } catch (e: any) { toast.show(e.message, "err"); } } };
}
async function announce(msg: string) { try { const r = await apiFetch("/announce", "POST", { message: msg }); toast.show(r.message || "公告已发送", "ok"); } catch (e: any) { toast.show(e.message, "err"); } }
async function saveWorld() { try { const r = await apiFetch("/save", "POST", {}); toast.show(r.message || "世界已保存", "ok"); } catch (e: any) { toast.show(e.message, "err"); } }
function shutdown(waittime: number, message: string) {
  confirm.value = { title: "关闭服务器", text: `将在 ${waittime} 秒后优雅关闭服务器，确认？`, danger: true, confirmLabel: "关闭",
    onOk: async () => { try { const r = await apiFetch("/shutdown", "POST", { waittime, message }); toast.show(r.message || "服务器将关闭", "ok"); } catch (e: any) { toast.show(e.message, "err"); } } };
}
function stopServer() {
  confirm.value = { title: "强制停止", text: "将立即强制停止服务器，可能造成未保存数据丢失！", danger: true, confirmLabel: "立即停止",
    onOk: async () => { try { const r = await apiFetch("/stop", "POST", {}); toast.show(r.message || "服务器已停止", "ok"); } catch (e: any) { toast.show(e.message, "err"); } } };
}
function unban(userid: string) {
  if (!userid.trim()) return;
  confirm.value = { title: "解封玩家", text: `确定要解封用户 ${userid} 吗？`,
    onOk: async () => { try { const r = await apiFetch("/unban", "POST", { userid: userid.trim() }); toast.show(r.message || "已解封", "ok"); } catch (e: any) { toast.show(e.message, "err"); } } };
}
async function loadSettings() { try { settings.value = await apiFetch("/settings"); settingsStatus.value = "ok"; } catch (e: any) { settingsStatus.value = "err"; toast.show(e.message, "err"); } }
function onConfirmOk() { const cb = confirm.value?.onOk; confirm.value = null; cb?.(); }
</script>
