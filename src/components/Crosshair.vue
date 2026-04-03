<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  hit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hit: false,
});

const crosshairClass = ref('crosshair');

watch(() => props.hit, (isHit) => {
  if (isHit) {
    crosshairClass.value = 'crosshair crosshair-hit';
  } else {
    crosshairClass.value = 'crosshair';
  }
});
</script>

<template>
  <div :class="crosshairClass">
    <div class="crosshair-dot"></div>
  </div>
</template>

<style scoped>
@import '../styles/game.css';
</style>
