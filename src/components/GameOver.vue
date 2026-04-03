<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  winner?: string;
  winnerTeam?: 'blue' | 'red';
  myTeam?: 'blue' | 'red';
}

const props = withDefaults(defineProps<Props>(), {
  winner: '',
  winnerTeam: 'blue',
  myTeam: 'blue',
});

const emit = defineEmits<{
  playAgain: [];
}>();

const isVictory = computed(() => props.winnerTeam === props.myTeam);
const resultText = computed(() => isVictory.value ? '胜利!' : '失败!');
</script>

<template>
  <div class="game-over">
    <div class="crt-overlay"></div>

    <h1 class="game-over-title neon-text">
      游戏结束
    </h1>

    <div
      class="game-over-winner"
      :class="isVictory ? 'victory' : 'defeat'"
    >
      {{ resultText }}
    </div>

    <button class="btn-retro neon-border" @click="emit('playAgain')">
      再次对战
    </button>
  </div>
</template>

<style scoped>
@import '../styles/game.css';
</style>
