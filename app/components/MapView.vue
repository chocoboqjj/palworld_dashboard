<template>
  <div class="card p-5">
    <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <h2 class="text-sm font-semibold text-white/70">世界地图</h2>
      <span class="text-xs text-white/30">{{ located.length }} 名玩家已定位</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-6 gap-4">
      <div class="lg:col-span-3">
        <div class="relative w-full aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-ink-950 select-none">
          <img
            src="/palworld-map/full-map-native-8192.webp"
            alt="Palworld world map"
            draggable="false"
            @error="imgError = true"
            class="absolute inset-0 w-full h-full object-cover"
          />

          <div
            v-for="(p, idx) in located"
            :key="keyOf(p, idx)"
            class="absolute z-10"
            :style="markerStyle(p)"
            @mouseenter="hover = keyOf(p, idx)"
            @mouseleave="hover = null"
          >
            <!-- 定位扩散波纹 -->
            <span class="ripple" />
            <span class="ripple ripple-2" />
            <div
              :class="[
                'rounded-full border-2 border-white/80 shadow-md transition-all duration-200 -translate-x-1/2 -translate-y-1/2',
                hover === keyOf(p, idx) ? 'scale-150' : '',
              ]"
              :style="{
                width: hover === keyOf(p, idx) ? '12px' : '8px',
                height: hover === keyOf(p, idx) ? '12px' : '8px',
                backgroundColor: hover === keyOf(p, idx) ? '#6ee7b7' : '#34d399',
              }"
            />
            <div
              v-if="hover === keyOf(p, idx)"
              class="absolute whitespace-nowrap rounded-lg bg-ink-950/95 border border-white/[0.1] px-2.5 py-1.5 text-xs shadow-lg z-20 animate-pop-in backdrop-blur-md"
              :style="tooltipStyle(p)"
            >
              <div class="font-medium text-white/90">{{ p.name || "未知玩家" }}</div>
              <div class="text-white/40 mt-0.5">
                Lv.{{ fmt(p.level) }} · ({{ fmt(p.location_x, 0) }}, {{ fmt(p.location_y, 0) }})
              </div>
            </div>
          </div>

          <div v-if="imgError" class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span class="bg-ink-950/90 border border-rose-400/20 rounded-lg px-3 py-1.5 text-xs text-rose-300 text-center max-w-[80%]">地图加载失败</span>
          </div>
          <div v-if="!imgError && located.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span class="bg-ink-950/80 rounded-lg px-3 py-1.5 text-xs text-white/25">暂无玩家位置</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-3 flex flex-col rounded-xl bg-ink-900/40 border border-white/[0.06] p-4">
        <div class="text-xs text-white/30 mb-3 px-1">已定位玩家</div>
        <div v-if="located.length === 0" class="flex-1 flex items-center justify-center text-xs text-white/15 py-8">暂无数据</div>
        <ul v-else class="flex flex-col gap-1.5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto pr-0.5">
          <li
            v-for="(p, idx) in located"
            :key="keyOf(p, idx)"
            @mouseenter="hover = keyOf(p, idx)"
            @mouseleave="hover = null"
            :class="[
              'flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-default transition-all duration-200',
              hover === keyOf(p, idx)
                ? 'border-emerald-400/30 bg-emerald-400/10'
                : 'border-white/[0.04] hover:border-white/[0.08]',
            ]"
          >
            <span :class="['text-xs font-mono w-6 shrink-0', hover === keyOf(p, idx) ? 'text-emerald-300' : 'text-white/20']">
              {{ String(idx + 1).padStart(2, '0') }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-white/80 truncate">{{ p.name || "未知玩家" }}</div>
              <div class="text-xs text-white/30 mt-0.5 truncate">
                Lv.{{ fmt(p.level) }} · ({{ fmt(p.location_x, 0) }}, {{ fmt(p.location_y, 0) }})
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Player } from "~/utils/types";
import { toPercent, hasValidLocation } from "~/utils/map";
import { fmt } from "~/utils/format";

const props = defineProps<{ players: Player[] }>();
const hover = ref<string | null>(null);
const imgError = ref(false);

const located = computed(() => props.players.filter((p) => hasValidLocation(p.location_x, p.location_y)));

function keyOf(p: Player, idx: number): string { return p.userId || p.playerId || String(idx); }
function markerStyle(p: Player) { const { left, top } = toPercent(p.location_x!, p.location_y!); return { left: `${left}%`, top: `${top}%` }; }

function tooltipStyle(p: Player) {
  const { left, top } = toPercent(p.location_x!, p.location_y!);
  const nearTop = top < 15;
  const nearBottom = top > 85;
  const nearLeft = left < 15;
  const nearRight = left > 85;

  const style: Record<string, string> = {};

  // 垂直方向：靠近顶部则气泡在下方，否则在上方
  if (nearTop) {
    style.top = "10px";
  } else {
    style.bottom = "calc(100% + 6px)";
  }

  // 水平方向：靠近边缘则对齐边缘，否则居中
  if (nearLeft) {
    style.left = "0";
    style.transform = "translateX(0)";
  } else if (nearRight) {
    style.right = "0";
    style.transform = "translateX(0)";
  } else {
    style.left = "50%";
    style.transform = "translateX(-50%)";
  }

  return style;
}
</script>

<style scoped>
.ripple {
  position: absolute;
  left: 0;
  top: 0;
  width: 18px;
  height: 18px;
  margin-left: -9px;
  margin-top: -9px;
  border-radius: 9999px;
  background-color: rgba(52, 211, 153, 0.55);
  box-shadow: 0 0 14px rgba(52, 211, 153, 0.6);
  opacity: 0;
  pointer-events: none;
  animation: ripple-out 2.4s ease-out infinite;
}
.ripple-2 { animation-delay: 1.2s; }
@keyframes ripple-out {
  0%   { transform: scale(0.3); opacity: 1; }
  100% { transform: scale(8); opacity: 0; }
}
</style>
