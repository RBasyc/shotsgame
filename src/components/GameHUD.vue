<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  myScore?: number;
  opponentScore?: number;
  health?: number;
}

const props = withDefaults(defineProps<Props>(), {
  myScore: 0,
  opponentScore: 0,
  health: 100,
});

const healthPercentage = computed(() => props.health);
</script>

<template>
  <div class="game-hud">
    <!-- 分数板 -->
    <div class="hud-top">
      <div class="hud-score score-blue neon-box">
        {{ myScore }}
      </div>
      <div class="hud-score neon-text" style="font-family: var(--font-heading); font-size: 1.5rem;">
        VS
      </div>
      <div class="hud-score score-red neon-box">
        {{ opponentScore }}
      </div>
    </div>

    <!-- 血量条 -->
    <div class="hud-bottom">
      <div class="health-bar neon-border">
        <div
          class="health-fill"
          :style="{ width: `${healthPercentage}%` }"
        ></div>
        <div class="health-text">
          {{ health }} / 100 HP
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/game.css';
</style>
