<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  showButtons?: boolean;
  myRoomId?: string;
  showJoinInput?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showButtons: true,
  myRoomId: '',
  showJoinInput: false,
});

const emit = defineEmits<{
  createRoom: [];
  showJoinInput: [];
  joinRoom: [roomId: string];
  cancelJoin: [];
}>();

const joinRoomId = ref('')
const joinErrorMessage = ref('')

function handleJoinRoom() {
  if (!joinRoomId.value || joinRoomId.value.length !== 6) {
    joinErrorMessage.value = '请输入6位房间码'
    return
  }
  emit('joinRoom', joinRoomId.value.toUpperCase())
}

function handleCancelJoin() {
  joinRoomId.value = ''
  joinErrorMessage.value = ''
  emit('cancelJoin')
}
</script>

<template>
  <div class="game-menu">
    <div class="crt-overlay"></div>

    <h1 class="menu-title neon-text scan-effect">
      SHOTSGAME
    </h1>
    <p class="menu-subtitle">1V1 在线射击对战</p>

    <!-- 房间码显示区域 -->
    <div v-if="myRoomId" class="room-code-display">
      <div class="room-code-label">你的房间码</div>
      <div class="room-code-value">{{ myRoomId }}</div>
      <div class="room-code-hint">分享给朋友即可开始对战</div>
    </div>

    <!-- 加入房间输入框 -->
    <div v-if="showJoinInput" class="join-room-input">
      <input
        v-model="joinRoomId"
        type="text"
        placeholder="输入6位房间码"
        maxlength="6"
        class="room-input"
        @keyup.enter="handleJoinRoom"
      />
      <div v-if="joinErrorMessage" class="error-message">
        {{ joinErrorMessage }}
      </div>
      <div class="join-buttons">
        <button class="btn-retro neon-border" @click="handleJoinRoom">
          <span class="btn-text">加入</span>
        </button>
        <button class="btn-retro neon-border" @click="handleCancelJoin">
          <span class="btn-text">取消</span>
        </button>
      </div>
    </div>

    <!-- 菜单按钮 -->
    <div v-if="showButtons" class="menu-buttons">
      <button class="btn-retro neon-border" @click="emit('createRoom')">
        <span class="btn-text">创建房间</span>
      </button>
      <button class="btn-retro neon-border" @click="emit('showJoinInput')">
        <span class="btn-text">加入房间</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.game-menu {
  width: 100vw;
  height: 100vh;
  background: #0F0F23;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif;
  position: relative;
}

.crt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 1000;
}

.menu-title {
  font-size: 4rem;
  color: #7C3AED;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  position: relative;
  overflow: hidden;
}

.neon-text {
  text-shadow:
    0 0 5px #7C3AED,
    0 0 10px #7C3AED,
    0 0 20px #7C3AED,
    0 0 40px #7C3AED;
}

.scan-effect {
  position: relative;
}

.scan-effect::after {
  content: 'SHOTSGAME';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 40%,
    rgba(167, 139, 250, 0.8) 50%,
    rgba(167, 139, 250, 1) 55%,
    #A78BFA 60%,
    rgba(167, 139, 250, 1) 65%,
    rgba(167, 139, 250, 0.8) 70%,
    transparent 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: scanLineText 3s ease-in-out infinite;
}

@keyframes scanLineText {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

.menu-subtitle {
  color: #A78BFA;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  letter-spacing: 2px;
}

.room-code-display {
  margin-top: 3rem;
  text-align: center;
  animation: fadeIn 0.5s ease;
}

.room-code-label {
  color: #A78BFA;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
}

.room-code-value {
  font-size: 3rem;
  color: #7C3AED;
  font-weight: bold;
  letter-spacing: 8px;
  text-shadow:
    0 0 10px #7C3AED,
    0 0 20px #7C3AED,
    0 0 30px #7C3AED;
  margin-bottom: 0.5rem;
}

.room-code-hint {
  color: #E2E8F0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.join-room-input {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: fadeIn 0.5s ease;
}

.room-input {
  font-size: 1.5rem;
  padding: 0.8rem 1.5rem;
  background: rgba(15, 15, 35, 0.9);
  border: 2px solid #7C3AED;
  color: #E2E8F0;
  text-align: center;
  letter-spacing: 4px;
  text-transform: uppercase;
  outline: none;
  transition: all 0.3s;
}

.room-input:focus {
  border-color: #A78BFA;
  box-shadow:
    0 0 10px #7C3AED,
    0 0 20px #7C3AED;
}

.room-input::placeholder {
  letter-spacing: 2px;
  text-transform: none;
  opacity: 0.5;
}

.error-message {
  color: #F43F5E;
  font-size: 0.9rem;
  text-shadow: 0 0 5px #F43F5E;
}

.join-buttons {
  display: flex;
  gap: 1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-retro {
  font-family: Arial, sans-serif;
  font-size: 1.2rem;
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid #7C3AED;
  color: #E2E8F0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.btn-text {
  position: relative;
  z-index: 2;
}

/* 扫描线效果 */
.btn-retro::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 40%,
    rgba(124, 58, 237, 0.6) 50%,
    rgba(124, 58, 237, 0.9) 55%,
    #7C3AED 60%,
    rgba(124, 58, 237, 0.9) 65%,
    rgba(124, 58, 237, 0.6) 70%,
    transparent 100%
  );
  z-index: 1;
}

/* 始终播放扫描动画 */
.btn-retro::before {
  animation: scanLine 2s ease-in-out infinite;
}

.btn-retro:hover {
  color: white;
  box-shadow:
    0 0 10px #7C3AED,
    0 0 20px #7C3AED,
    0 0 30px #7C3AED,
    0 0 40px #7C3AED;
  border-color: #A78BFA;
  transform: scale(1.05);
}

.btn-retro:hover::before {
  animation: scanLine 1s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 35%,
    rgba(167, 139, 250, 0.8) 50%,
    rgba(167, 139, 250, 1) 55%,
    #A78BFA 60%,
    rgba(167, 139, 250, 1) 65%,
    rgba(167, 139, 250, 0.8) 70%,
    transparent 100%
  );
}

@keyframes scanLine {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

.neon-border {
  box-shadow:
    0 0 5px #7C3AED,
    inset 0 0 5px #7C3AED;
}

.btn-cta {
  border-color: #F43F5E;
}

.btn-cta::before {
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 40%,
    rgba(244, 63, 94, 0.6) 50%,
    rgba(244, 63, 94, 0.9) 55%,
    #F43F5E 60%,
    rgba(244, 63, 94, 0.9) 65%,
    rgba(244, 63, 94, 0.6) 70%,
    transparent 100%
  );
}

/* 始终播放扫描动画 */
.btn-cta::before {
  animation: scanLine 2s ease-in-out infinite;
}

.btn-cta:hover {
  color: white;
  box-shadow:
    0 0 10px #F43F5E,
    0 0 20px #F43F5E,
    0 0 30px #F43F5E,
    0 0 40px #F43F5E;
  border-color: #FB7185;
  transform: scale(1.05);
}

.btn-cta:hover::before {
  animation: scanLine 1s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 35%,
    rgba(251, 113, 133, 0.8) 50%,
    rgba(251, 113, 133, 1) 55%,
    #FB7185 60%,
    rgba(251, 113, 133, 1) 65%,
    rgba(251, 113, 133, 0.8) 70%,
    transparent 100%
  );
}

</style>
