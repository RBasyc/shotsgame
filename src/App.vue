<script setup lang="ts">
import { ref } from 'vue'
import GameMenu from './components/GameMenu.vue'
import GameCanvasNetwork from './components/GameCanvasNetwork.vue'
import { SimpleNetworkManager } from './game/core/SimpleNetwork'

const gameStarted = ref(false)
const myRoomId = ref('')
const showJoinInput = ref(false)

// 创建网络管理器实例
const networkManager = new SimpleNetworkManager()

// 监听房间创建成功
networkManager.on('roomCreated', (data: any) => {
  console.log('✅ 房间创建成功！', data)
  myRoomId.value = data.roomId
})

// 监听加入房间成功
networkManager.on('roomJoined', (data: any) => {
  console.log('✅ 加入房间成功！', data)
  showJoinInput.value = false
})

// 监听玩家加入
networkManager.on('playerJoined', (data: any) => {
  console.log('👥 有玩家加入房间', data)
})

// 监听加入错误
networkManager.on('joinError', (data: any) => {
  console.error('❌ 加入房间失败:', data.message)
})

// 监听匹配成功
networkManager.on('matchFound', (data: any) => {
  console.log('✅ 匹配成功！', data)
})

// 监听游戏开始
networkManager.on('gameStart', (data: any) => {
  console.log('🎮 App.vue 收到 gameStart 事件')
  console.log('玩家数据:', data.players)
  if (!gameStarted.value) {
    gameStarted.value = true
  }
})

function handleCreateRoom() {
  console.log('点击创建房间')
  networkManager.createRoom()
}

function handleShowJoinInput() {
  showJoinInput.value = true
}

function handleJoinRoom(roomId: string) {
  console.log('加入房间:', roomId)
  networkManager.joinRoom(roomId)
}

function handleCancelJoin() {
  showJoinInput.value = false
}
</script>

<template>
  <div id="app">
    <div class="crt-overlay"></div>

    <!-- 主菜单 -->
    <div v-if="!gameStarted" class="menu-container">
      <GameMenu
        :show-buttons="!myRoomId && !showJoinInput"
        :my-room-id="myRoomId"
        :show-join-input="showJoinInput"
        @create-room="handleCreateRoom"
        @show-join-input="handleShowJoinInput"
        @join-room="handleJoinRoom"
        @cancel-join="handleCancelJoin"
      />
    </div>

    <!-- 网络对战 -->
    <div v-if="gameStarted" class="game-container">
      <GameCanvasNetwork :network-manager="networkManager" />

      <!-- 准星 -->
      <div class="crosshair">
        <div class="crosshair-dot"></div>
        <div class="crosshair-circle"></div>
      </div>

      <!-- 顶部提示 -->
      <div class="top-hud">
        <div class="hud-title">🌐 网络对战模式</div>
        <div class="hud-text">
          房间邀请制对战
        </div>
      </div>

      <!-- 返回按钮 -->
      <button class="back-btn" @click="gameStarted = false; myRoomId = ''">
        ← 返回菜单
      </button>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 100vw;
  height: 100vh;
  background: #0F0F23;
  font-family: Arial, sans-serif;
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

.menu-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
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

.game-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 100;
}

.crosshair-dot {
  width: 8px;
  height: 8px;
  background: #00FF00;
  border-radius: 50%;
  box-shadow:
    0 0 10px #00FF00,
    0 0 20px #00FF00;
  position: relative;
  z-index: 2;
}

.crosshair-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid #00FF00;
  border-radius: 50%;
  box-shadow:
    0 0 5px #00FF00,
    inset 0 0 5px #00FF00;
}

.top-hud {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 15, 35, 0.9);
  border: 2px solid #7C3AED;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  text-align: center;
  z-index: 100;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
}

.hud-title {
  color: #A78BFA;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.hud-text {
  color: #E2E8F0;
  font-size: 0.9rem;
}

.back-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 0.6rem 1.2rem;
  background: rgba(15, 15, 35, 0.9);
  border: 2px solid #7C3AED;
  color: #E2E8F0;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  z-index: 100;
}

.back-btn:hover {
  background: #7C3AED;
  box-shadow: 0 0 15px #7C3AED;
  color: white;
}
</style>
