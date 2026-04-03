<script setup lang="ts">
import { ref } from 'vue';

interface KillMessage {
  id: string;
  text: string;
}

const kills = ref<KillMessage[]>([]);

function addKill(message: string) {
  const id = Date.now().toString();
  kills.value.push({ id, text: message });

  // 3秒后移除
  setTimeout(() => {
    kills.value = kills.value.filter(k => k.id !== id);
  }, 3000);
}

defineExpose({
  addKill,
});
</script>

<template>
  <div class="kill-feed">
    <div
      v-for="kill in kills"
      :key="kill.id"
      class="kill-message neon-box"
    >
      {{ kill.text }}
    </div>
  </div>
</template>

<style scoped>
@import '../styles/game.css';
</style>
