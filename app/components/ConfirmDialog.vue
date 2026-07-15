<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
    @click.self="emit('cancel')"
  >
    <div class="card w-full max-w-sm p-6 animate-pop-in">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-white/70">{{ title }}</h2>
        <button @click="emit('cancel')" class="btn !p-1.5 !border-0"><X class="h-4 w-4" /></button>
      </div>
      <p class="text-sm text-white/45 mb-6">{{ text }}</p>
      <div class="flex justify-end gap-2">
        <button class="btn" @click="emit('cancel')">取消</button>
        <button :class="danger ? 'btn btn-danger' : 'btn btn-warn'" @click="emit('confirm')">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";

withDefaults(defineProps<{
  open: boolean; title: string; text: string;
  confirmLabel?: string; danger?: boolean;
}>(), { confirmLabel: "确认", danger: false });

const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>
