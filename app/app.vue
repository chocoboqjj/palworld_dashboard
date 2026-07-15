<template>
  <div class="relative z-[1]">
    <NuxtPage />
    <div
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="[
          'px-4 py-2.5 text-sm rounded-xl border backdrop-blur-xl shadow-lg animate-pop-in',
          t.type === 'ok'
            ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
            : t.type === 'err'
              ? 'border-rose-400/20 bg-rose-400/10 text-rose-300'
              : 'border-white/[0.08] bg-white/[0.06] text-white/80',
        ]"
      >
        {{ t.msg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items: toasts } = useToast();
</script>
