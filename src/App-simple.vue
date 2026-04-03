<script setup lang="ts">
import { ref } from 'vue';
import GameMenu from './components/GameMenu.vue';

const findingMatch = ref(false);

function handleFindMatch() {
  console.log('寻找对战');
  findingMatch.value = true;
}

function handleCancelMatch() {
  console.log('取消匹配');
  findingMatch.value = false;
}
</script>

<template>
  <div id="app">
    <!-- CRT 扫描线覆盖层 -->
    <div class="crt-overlay"></div>

    <!-- 主菜单 -->
    <GameMenu
      :finding="findingMatch"
      @find-match="handleFindMatch"
      @cancel-match="handleCancelMatch"
    />
  </div>
</template>

<style>
@import './styles/game.css';

#app {
  width: 100vw;
  height: 100vh;
  background: #0F0F23;
}
</style>
