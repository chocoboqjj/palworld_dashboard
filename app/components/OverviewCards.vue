<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in">
    <div v-for="c in cards" :key="c.label" class="card px-4 py-4 group cursor-default">
      <div class="flex items-center gap-2 mb-2">
        <component :is="c.icon" :class="['h-4 w-4', c.accent]" />
        <span class="text-xs text-white/40">{{ c.label }}</span>
      </div>
      <div :class="['text-2xl font-bold font-mono tabular-nums tracking-tight', c.accent]">
        <AnimatedNumber v-if="c.num !== null" :value="c.num" :precision="c.precision" />
        <span v-else>{{ c.text ?? "—" }}</span>
        <span v-if="c.unit" class="text-sm font-medium text-white/40 ml-1">{{ c.unit }}</span>
      </div>
      <div class="mt-1.5 text-xs text-white/25 truncate">{{ c.sub }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Gauge, Timer, Users, Clock, Castle, CalendarDays } from "lucide-vue-next";
import type { Metrics, ServerInfo } from "~/utils/types";
import { humanUptime } from "~/utils/format";

const props = defineProps<{ metrics: Metrics | null; info: ServerInfo | null }>();

interface CardDef { icon: any; label: string; num: number | null; text?: string | null; precision?: number; unit?: string; sub: string; accent: string; }
const cards = computed<CardDef[]>(() => {
  const m = props.metrics;
  return [
    { icon: Gauge, label: "服务器 FPS", num: m ? m.serverfps : null, sub: props.info?.version ?? "", accent: "text-sky-400" },
    { icon: Timer, label: "帧时间", num: m ? m.serverframetime : null, precision: 1, unit: "ms", sub: "", accent: "text-violet-400" },
    { icon: Users, label: "在线玩家", num: m ? m.currentplayernum : null, sub: `上限 ${m?.maxplayernum ?? "—"}`, accent: "text-emerald-400" },
    { icon: Clock, label: "运行时长", num: null, text: humanUptime(m?.uptime), sub: "自启动", accent: "text-amber-400" },
    { icon: Castle, label: "基地数量", num: m ? m.basecampnum : null, sub: "", accent: "text-rose-400" },
    { icon: CalendarDays, label: "游戏天数", num: m ? m.days : null, sub: props.info?.description ?? "", accent: "text-cyan-400" },
  ];
});
</script>
