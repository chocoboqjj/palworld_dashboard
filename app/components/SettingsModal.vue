<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
    @click.self="emit('close')"
  >
    <div class="card w-full max-w-md p-6 animate-pop-in">
      <div class="flex items-center justify-between mb-1">
        <h2 class="text-sm font-semibold text-white/70">连接设置</h2>
        <button @click="emit('close')" class="btn !p-1.5 !border-0"><X class="h-4 w-4" /></button>
      </div>
      <p class="text-xs text-white/35 mb-5">
        使用 Palworld 官方 REST API，需在服务器配置 <code class="text-accent-soft/70">RESTAPIEnabled=True</code>。
      </p>

      <label class="label">服务器地址</label>
      <div class="flex gap-2 mb-4">
        <input class="input flex-1" placeholder="127.0.0.1" v-model="ip" />
        <span class="self-center text-white/20">:</span>
        <input class="input !w-24" placeholder="8212" inputmode="numeric" v-model="port" @input="port = port.replace(/[^\d]/g, '')" />
      </div>

      <label class="label">用户名</label>
      <input class="input mb-4" placeholder="admin" v-model="username" />

      <label class="label">
        密码
        <span v-if="requirePassword" class="ml-2 text-rose-400/70 text-xs">· 会话已过期</span>
      </label>
      <input type="password" class="input mb-4" placeholder="••••••••" v-model="password" />

      <label class="label">会话超时 (分钟) <span class="ml-2 text-white/20 text-xs font-normal">0 = 永不过期</span></label>
      <input type="number" min="0" class="input mb-5" placeholder="60" v-model.number="timeoutMin" />

      <div
        v-if="testResult"
        :class="[
          'mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm backdrop-blur-md',
          testResult.ok
            ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-300'
            : 'border-rose-400/20 bg-rose-400/8 text-rose-300',
        ]"
      >
        <CheckCircle2 v-if="testResult.ok" class="h-4 w-4 mt-0.5 shrink-0" />
        <XCircle v-else class="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <div class="font-medium">{{ testResult.ok ? "认证成功" : `失败 (${testResult.status ?? "—"})` }}</div>
          <div class="opacity-70 text-xs mt-0.5">{{ testResult.ok ? (testResult.servername || testResult.version || "已连接") : testResult.error }}</div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3">
        <span class="text-xs text-white/25 font-mono">{{ statusMsg }}</span>
        <div class="flex gap-2">
          <button class="btn" :disabled="testing || busy" @click="doTest">
            <FlaskConical class="h-4 w-4" /> {{ testing ? "测试中…" : "测试连接" }}
          </button>
          <button class="btn btn-primary" :disabled="busy || testing" @click="doSave">
            {{ busy ? "处理中…" : "保存并测试" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { X, FlaskConical, CheckCircle2, XCircle } from "lucide-vue-next";
import type { ConnConfig } from "~/utils/types";
import { parseBaseURL, buildBaseURL } from "~/utils/types";
import { testConnection, type TestResult } from "~/utils/api";

const props = defineProps<{ open: boolean; initial?: ConnConfig; requirePassword?: boolean }>();
const emit = defineEmits<{ close: []; save: [cfg: ConnConfig] }>();

const ip = ref("");
const port = ref("");
const username = ref("admin");
const password = ref("");
const timeoutMin = ref(60);
const statusMsg = ref("");
const busy = ref(false);
const testing = ref(false);
const testResult = ref<TestResult | null>(null);

watch(() => props.open, (isOpen) => {
  if (!isOpen) return;
  const c = props.initial;
  const { ip: pIp, port: pPort } = parseBaseURL(c?.baseURL ?? "");
  ip.value = pIp; port.value = pPort;
  username.value = c?.username || "admin";
  password.value = "";
  timeoutMin.value = c?.sessionTimeoutMin ?? 60;
  statusMsg.value = ""; testResult.value = null;
});

function draft(): ConnConfig {
  return { baseURL: buildBaseURL(ip.value, port.value), ip: ip.value.trim(), port: port.value.trim(), username: username.value, password: password.value, sessionTimeoutMin: Number(timeoutMin.value) || 0 };
}

async function doSave() {
  if (!ip.value.trim() || !port.value.trim()) { statusMsg.value = "请填写服务器地址与端口"; return; }
  if (!/^\d{1,5}$/.test(port.value.trim()) || Number(port.value) > 65535) { statusMsg.value = "端口号不合法 (1-65535)"; return; }
  if (props.requirePassword && !password.value.trim()) { statusMsg.value = "会话已过期，请重新输入密码"; return; }
  busy.value = true; statusMsg.value = "";
  try { emit("save", draft()); } catch (e: any) { statusMsg.value = e?.message ?? e; } finally { busy.value = false; }
}

async function doTest() {
  if (!ip.value.trim() || !port.value.trim()) { statusMsg.value = "请先填写地址与端口"; return; }
  testing.value = true; testResult.value = null;
  try { testResult.value = await testConnection(draft()); } catch (e: any) { testResult.value = { ok: false, error: e?.message ?? "请求失败" }; }
  finally { testing.value = false; }
}
</script>
