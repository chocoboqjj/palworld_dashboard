<template>
  <span class="inline-block tabular-nums">{{ display }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";

const props = defineProps<{
  value: number;
  precision?: number;
  duration?: number;
}>();

const current = ref(props.value);
const display = ref(fmt(props.value));

let raf = 0;
let from = props.value;
let to = props.value;
let start = 0;

function fmt(v: number): string {
  if (!isFinite(v)) return "—";
  return v.toFixed(props.precision ?? 0);
}

function step(ts: number) {
  if (!start) start = ts;
  const t = Math.min(1, (ts - start) / (props.duration ?? 450));
  const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
  current.value = from + (to - from) * eased;
  display.value = fmt(current.value);
  if (t < 1) raf = requestAnimationFrame(step);
}

watch(
  () => props.value,
  (v) => {
    cancelAnimationFrame(raf);
    from = current.value;
    to = v;
    start = 0;
    raf = requestAnimationFrame(step);
  },
);

onUnmounted(() => cancelAnimationFrame(raf));
</script>
