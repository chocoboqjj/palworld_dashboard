<template>
  <div class="card p-5">
    <h2 class="text-sm font-semibold text-white/70 mb-4">服务器操作</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- 公告 -->
      <div class="action-tile">
        <div class="flex items-center gap-1.5 mb-2">
          <Megaphone class="h-3.5 w-3.5 text-accent-soft/70" />
          <span class="text-xs text-white/45 font-medium">发送公告</span>
        </div>
        <div class="flex gap-2">
          <input v-model="msg" placeholder="输入公告消息…" class="input" @keydown.enter="sendAnnounce" />
          <button class="btn btn-primary shrink-0" :disabled="!msg.trim()" @click="sendAnnounce">发送</button>
        </div>
      </div>

      <!-- 保存 -->
      <div class="action-tile">
        <div class="flex items-center gap-1.5 mb-2">
          <Save class="h-3.5 w-3.5 text-white/30" />
          <span class="text-xs text-white/45 font-medium">保存世界</span>
        </div>
        <button class="btn w-full" @click="emit('save')">保存当前世界</button>
      </div>

      <!-- 优雅关闭 -->
      <div class="action-tile">
        <div class="flex items-center gap-1.5 mb-2">
          <Power class="h-3.5 w-3.5 text-amber-300/60" />
          <span class="text-xs text-white/45 font-medium">优雅关闭</span>
        </div>
        <div class="flex gap-2 items-center">
          <input type="number" min="0" v-model.number="wait" class="input w-16" />
          <span class="text-xs text-white/20 shrink-0">秒后</span>
          <input v-model="shutdownMsg" placeholder="提示消息" class="input" />
          <button class="btn btn-warn shrink-0" @click="emit('shutdown', wait, shutdownMsg)">关闭</button>
        </div>
      </div>

      <!-- 强制停止 -->
      <div class="action-tile !border-rose-400/12 !bg-rose-400/[0.03]">
        <div class="flex items-center gap-1.5 mb-2">
          <OctagonX class="h-3.5 w-3.5 text-rose-400/55" />
          <span class="text-xs text-rose-300/55 font-medium">强制停止</span>
        </div>
        <button class="btn btn-danger w-full" @click="emit('stop')">立即停止服务器</button>
      </div>

      <!-- 解封 -->
      <div class="action-tile md:col-span-2">
        <div class="flex items-center gap-1.5 mb-2">
          <ShieldOff class="h-3.5 w-3.5 text-white/25" />
          <span class="text-xs text-white/45 font-medium">解封玩家</span>
        </div>
        <div class="flex gap-2">
          <input v-model="unbanId" placeholder="输入 User ID…" class="input" @keydown.enter="sendUnban" />
          <button class="btn shrink-0" :disabled="!unbanId.trim()" @click="sendUnban">解封</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Megaphone, Save, Power, OctagonX, ShieldOff } from "lucide-vue-next";

const emit = defineEmits<{
  announce: [msg: string];
  save: [];
  shutdown: [waittime: number, message: string];
  stop: [];
  unban: [userid: string];
}>();

const msg = ref("");
const wait = ref(60);
const shutdownMsg = ref("");
const unbanId = ref("");

function sendAnnounce() { if (!msg.value.trim()) return; emit("announce", msg.value.trim()); msg.value = ""; }
function sendUnban() { if (!unbanId.value.trim()) return; emit("unban", unbanId.value.trim()); unbanId.value = ""; }
</script>
