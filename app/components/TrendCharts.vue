<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="card p-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-white/70">服务器 FPS 趋势</h2>
        <span v-if="fps.length" class="text-xs text-white/30 font-mono"><AnimatedNumber :value="fps[fps.length - 1]" :precision="1" /> FPS</span>
      </div>
      <Sparkline :data="fps" color="#38bdf8" gradient-id="g-fps" label="FPS" unit="" :precision="1" />
    </div>
    <div class="card p-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-white/70">在线玩家趋势</h2>
        <span v-if="players.length" class="text-xs text-white/30 font-mono"><AnimatedNumber :value="players[players.length - 1]" :precision="0" /> 人</span>
      </div>
      <Sparkline :data="players" color="#34d399" gradient-id="g-pl" label="玩家" unit=" 人" :precision="0" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ fps: number[]; players: number[] }>();
</script>
