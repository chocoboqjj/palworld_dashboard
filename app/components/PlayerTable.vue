<template>
  <div class="card p-5">
    <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <h2 class="text-sm font-semibold text-white/70">
        在线玩家 <span class="text-white/25 font-mono">({{ players.length }})</span>
      </h2>
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
        <input v-model="q" placeholder="搜索名称 / ID / IP" class="input pl-9 w-56" />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-white/25 text-xs border-b border-white/[0.04]">
            <th class="py-2.5 pr-2 font-medium w-6"></th>
            <th class="py-2.5 pr-3 font-medium">名称</th>
            <th class="py-2.5 pr-3 font-medium">账户</th>
            <th class="py-2.5 pr-3 font-medium">用户 ID</th>
            <th class="py-2.5 pr-3 font-medium">IP</th>
            <th class="py-2.5 pr-3 font-medium">延迟</th>
            <th class="py-2.5 pr-3 font-medium">等级</th>
            <th class="py-2.5 pr-3 font-medium">坐标</th>
            <th class="py-2.5 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="list.length === 0">
            <td colspan="9" class="py-10 text-center text-white/15 text-xs">
              {{ players.length ? "无匹配玩家" : "暂无数据" }}
            </td>
          </tr>
          <template v-for="(p, idx) in list" :key="rowKey(p, idx)">
            <tr class="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
              <td class="py-3 pr-2">
                <button @click="toggle(rowKey(p, idx))" class="text-white/20 hover:text-white/50 transition-colors">
                  <ChevronDown v-if="expanded.includes(rowKey(p, idx))" class="h-4 w-4" />
                  <ChevronRight v-else class="h-4 w-4" />
                </button>
              </td>
              <td class="py-3 pr-3 font-medium text-white/85">{{ p.name ?? "—" }}</td>
              <td class="py-3 pr-3 text-white/40">{{ p.accountName ?? "—" }}</td>
              <td class="py-3 pr-3 text-white/30 text-xs font-mono">{{ p.userId ?? "—" }}</td>
              <td class="py-3 pr-3 text-white/25 text-xs font-mono">{{ p.iP || "—" }}</td>
              <td class="py-3 pr-3">
                <span :class="['chip font-mono text-xs', pingTone(p.ping)]">{{ fmt(p.ping, 0) }} ms</span>
              </td>
              <td class="py-3 pr-3 text-white/60">Lv.{{ fmt(p.level) }}</td>
              <td class="py-3 pr-3 text-white/25 text-xs font-mono">{{ fmt(p.location_x, 0) }}, {{ fmt(p.location_y, 0) }}</td>
              <td class="py-3 text-right whitespace-nowrap">
                <button title="踢出" :disabled="!p.userId" @click="p.userId && emit('kick', p.userId)" class="btn !px-3 !py-1 !text-xs">
                  <UserX class="h-3.5 w-3.5" /> 踢
                </button>
                <button title="封禁" :disabled="!p.userId" @click="p.userId && emit('ban', p.userId)" class="btn btn-danger !px-3 !py-1 !text-xs ml-1.5">
                  <Ban class="h-3.5 w-3.5" /> 封
                </button>
              </td>
            </tr>
            <tr v-if="expanded.includes(rowKey(p, idx))" class="border-b border-white/[0.03] bg-white/[0.02]">
              <td colspan="9" class="p-0">
                <div class="px-4 py-3">
                  <div class="flex items-center gap-1.5 text-xs text-white/25 mb-2">
                    <Braces class="h-3.5 w-3.5" /> RAW JSON
                  </div>
                  <pre class="text-xs text-white/50 bg-white/[0.03] rounded-xl border border-white/[0.05] p-3 overflow-x-auto font-mono">{{ JSON.stringify(p, null, 2) }}</pre>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Search, UserX, Ban, ChevronDown, ChevronRight, Braces } from "lucide-vue-next";
import type { Player } from "~/utils/types";
import { fmt } from "~/utils/format";

const props = defineProps<{ players: Player[] }>();
const emit = defineEmits<{ kick: [userid: string]; ban: [userid: string]; }>();

const q = ref("");
const expanded = ref<string[]>([]);

function rowKey(p: Player, idx: number) { return p.userId || p.playerId || String(idx); }
function toggle(key: string) { const i = expanded.value.indexOf(key); i >= 0 ? expanded.value.splice(i, 1) : expanded.value.push(key); }

const list = computed(() =>
  props.players.filter((p) => {
    if (!q.value) return true;
    const s = q.value.toLowerCase();
    return [p.name, p.accountName, p.userId, p.playerId, p.iP].some((v) => String(v ?? "").toLowerCase().includes(s));
  }),
);

function pingTone(ping?: number) {
  if (ping == null) return "border-white/[0.05] text-white/25";
  if (ping > 150) return "border-rose-400/20 bg-rose-400/8 text-rose-300";
  if (ping > 80) return "border-amber-400/20 bg-amber-400/8 text-amber-300";
  return "border-emerald-400/20 bg-emerald-400/8 text-emerald-300";
}
</script>
