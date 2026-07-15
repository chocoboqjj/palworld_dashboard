<template>
  <div class="card p-5">
    <button @click="toggle" class="flex items-center justify-between w-full text-left">
      <span class="text-sm font-semibold text-white/70">服务器设置</span>
      <span class="flex items-center gap-1 text-xs text-white/25">
        {{ open ? "收起" : "展开" }}
        <ChevronDown :class="['h-4 w-4 transition-transform duration-200', open ? 'rotate-180' : '']" />
      </span>
    </button>

    <div v-if="open" class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 max-h-[420px] overflow-y-auto pr-1 animate-fade-in">
      <div v-if="!settings" class="col-span-full py-6 text-center text-white/15 text-xs">加载中…</div>
      <div v-for="[k, v] in entries" :key="k" class="flex items-center justify-between gap-3 py-2 border-b border-white/[0.03] text-xs">
        <span class="text-white/35 truncate" :title="k">{{ k }}</span>
        <span class="font-medium text-white/70 text-right truncate font-mono">
          {{ typeof v === "boolean" ? (v ? "true" : "false") : String(v) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ChevronDown } from "lucide-vue-next";

const props = defineProps<{ settings: Record<string, unknown> | null }>();
const emit = defineEmits<{ load: [] }>();

const open = ref(false);
const entries = computed(() => (props.settings ? Object.entries(props.settings) : []));

function toggle() {
  if (!open.value && !props.settings) emit("load");
  open.value = !open.value;
}
</script>
