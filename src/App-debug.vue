<script setup lang="ts">
import { ref, onMounted } from 'vue';

const message = ref('Loading...');

onMounted(() => {
  console.log('✅ Vue 组件已挂载');
  message.value = 'ShotsGame - 1v1 在线射击对战';
});
</script>

<template>
  <div class="debug-container">
    <h1 class="title">{{ message }}</h1>
    <p class="subtitle">如果你能看到这段文字，Vue 运行正常</p>
    <button class="btn" @click="alert('按钮点击正常！')">测试按钮</button>
  </div>
</template>

<style scoped>
.debug-container {
  width: 100vw;
  height: 100vh;
  background: #0F0F23;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif;
}

.title {
  color: #7C3AED;
  font-size: 4rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px #7C3AED;
}

.subtitle {
  color: #E2E8F0;
  font-size: 1.2rem;
  margin-bottom: 3rem;
}

.btn {
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid #7C3AED;
  color: #E2E8F0;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:hover {
  background: #7C3AED;
  box-shadow: 0 0 20px #7C3AED;
}
</style>
