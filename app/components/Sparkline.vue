<template>
  <div v-if="data.length < 2" class="h-[120px] flex items-center justify-center text-xs text-white/20">
    等待数据…
  </div>
  <div v-else class="relative" @mouseleave="hoverIdx = -1">
    <svg
      ref="svgRef"
      viewBox="0 0 500 120"
      class="w-full h-[120px]"
      preserveAspectRatio="none"
      @mousemove="onMouseMove"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.25" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.02" />
        </linearGradient>
      </defs>

      <path :d="displayArea" :fill="`url(#${gradientId})`" />
      <path :d="displayLine" fill="none" :stroke="color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

      <line
        v-if="hoverIdx >= 0"
        :x1="displayPts[hoverIdx]?.x ?? 0" y1="2"
        :x2="displayPts[hoverIdx]?.x ?? 0" y2="118"
        :stroke="color" stroke-opacity="0.25" stroke-width="1" stroke-dasharray="3 3"
      />
      <circle
        v-if="hoverIdx >= 0 && displayPts[hoverIdx]"
        :cx="displayPts[hoverIdx].x" :cy="displayPts[hoverIdx].y"
        r="4.5" :fill="color" stroke="#0a0a1a" stroke-width="2"
        class="cursor-dot"
      />
    </svg>
    <div
      v-if="hoverIdx >= 0"
      class="absolute -top-8 pointer-events-none text-xs text-white/90 bg-ink-950/95 border border-white/[0.1] rounded-lg px-2.5 py-1 whitespace-nowrap backdrop-blur-md shadow-lg"
      :style="{ left: tooltipLeft + 'px', transform: 'translateX(-50%)' }"
    >
      {{ label }}: <span class="font-semibold font-mono">{{ fmtVal(data[hoverIdx]) }}</span>{{ unit }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from "vue";

const props = defineProps<{
  data: number[];
  color: string;
  gradientId: string;
  label?: string;
  unit?: string;
  precision?: number;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const hoverIdx = ref(-1);
const tooltipLeft = ref(0);

type Pt = { x: number; y: number };

/* ---------- 平滑动画引擎 ---------- */
const displayPts = shallowRef<Pt[]>([]);
const SMOOTH = 0.13; // 每帧靠近 13% → ~20 帧收敛 ≈ 0.33s

const min = computed(() => Math.min(...props.data));
const max = computed(() => Math.max(...props.data));
const range = computed(() => (max.value - min.value) || 1);

const targetPts = computed<Pt[]>(() =>
  props.data.map((v, i) => ({
    x: (i / (props.data.length - 1)) * 492 + 4,
    y: 112 - ((v - min.value) / range.value) * 100 - 6,
  })),
);

let raf = 0;
function tick() {
  const target = targetPts.value;
  const current = displayPts.value;

  // 首帧直接置位
  if (current.length === 0) {
    displayPts.value = target.map(p => ({ ...p }));
  } else if (current.length !== target.length) {
    // 点数变化时补/裁，其余点保持当前动画状态
    const out: Pt[] = [];
    const n = Math.max(target.length, current.length);
    for (let i = 0; i < n; i++) {
      const c = current[i];
      const t = target[i];
      if (t && c) {
        out.push({ x: c.x + (t.x - c.x) * SMOOTH, y: c.y + (t.y - c.y) * SMOOTH });
      } else if (t) {
        out.push({ ...t });
      }
      // 忽略多余的 current 点（被裁剪）
    }
    displayPts.value = out;
  } else {
    // 同长度：每帧平滑逼近
    let allClose = true;
    const next: Pt[] = current.map((c, i) => {
      const t = target[i];
      const dx = t.x - c.x;
      const dy = t.y - c.y;
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) allClose = false;
      return {
        x: c.x + dx * SMOOTH,
        y: c.y + dy * SMOOTH,
      };
    });
    if (!allClose) displayPts.value = next;
  }

  raf = requestAnimationFrame(tick);
}

onMounted(() => { raf = requestAnimationFrame(tick); });
onUnmounted(() => { if (raf) cancelAnimationFrame(raf); });

/* ---------- 路径字符串 ---------- */
const displayLine = computed(() => {
  const p = displayPts.value;
  if (p.length < 2) return "";
  return "M" + p.map(t => `${t.x.toFixed(1)},${t.y.toFixed(1)}`).join(" L");
});

const displayArea = computed(() => {
  const p = displayPts.value;
  if (p.length < 2) return "";
  const line = p.map(t => `${t.x.toFixed(1)},${t.y.toFixed(1)}`).join(" L");
  return `M${p[0].x.toFixed(1)},${p[0].y.toFixed(1)} L${line} L${p[p.length - 1].x.toFixed(1)},112 L${p[0].x.toFixed(1)},112 Z`;
});

/* ---------- 工具 ---------- */
function fmtVal(v: number): string {
  return v.toFixed(props.precision ?? (Number.isInteger(v) ? 0 : 1));
}

function onMouseMove(e: MouseEvent) {
  const svg = svgRef.value;
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  const ratioX = (e.clientX - rect.left) / rect.width;
  const idx = Math.round(ratioX * (props.data.length - 1));
  hoverIdx.value = Math.max(0, Math.min(idx, props.data.length - 1));
  tooltipLeft.value = e.clientX - rect.left;
}
</script>

<style scoped>
.cursor-dot { animation: pop-in 0.15s ease-out both; }
@keyframes pop-in {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}
</style>
