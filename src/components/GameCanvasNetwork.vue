<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { SimpleNetworkManager } from '../game/core/SimpleNetwork'

// 接收网络管理器作为 props
const props = defineProps<{
  networkManager: SimpleNetworkManager
}>()

const containerRef = ref<HTMLDivElement>()
let animationId: number
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let player: {
  position: THREE.Vector3
  rotation: THREE.Euler
}
let opponents: Map<string, THREE.Group> = new Map()
let myId: string = ''
let myTeam: 'blue' | 'red' = 'blue'
let keys = {
  forward: false,
  backward: false,
  left: false,
  right: false
}
let pitch = 0
let yaw = 0

const PLAYER_SPEED = 0.15
const MOUSE_SENSITIVITY = 0.002
let lastUpdateTime = 0
const NETWORK_UPDATE_RATE = 50

// 定期检查对手显示（调试用）
let opponentCheckInterval: number | null = null

// 调试信息
const debugInfo = ref({
  connected: false,
  matched: false,
  opponentCount: 0,
  myId: '',
  myTeam: '',
  opponentId: '',
  opponentTeam: ''
})

// 使用传入的网络管理器
const networkManager = props.networkManager

networkManager.on('connected', (data: any) => {
  debugInfo.value.connected = true
  myId = data.socketId || networkManager.getSocketId()
  debugInfo.value.myId = myId
  console.log('✅ 已连接，我的 ID:', myId)
  console.log('完整网络管理器状态:', networkManager)
})

networkManager.on('matchFound', (data: any) => {
  console.log('匹配成功！', data)
  debugInfo.value.matched = true
  myTeam = data.team
  debugInfo.value.myTeam = data.team
})

// 处理游戏开始逻辑
function handleGameStart(data: any) {
  console.log('===== 游戏开始 =====')
  console.log('收到玩家数据:', JSON.stringify(data, null, 2))
  console.log('服务器确认的我的 Socket ID:', data.mySocketId)
  console.log('本地存储的我的 ID:', myId)

  // 使用服务器传来的 mySocketId
  if (data.mySocketId) {
    myId = data.mySocketId
    console.log('✅ 更新我的 ID 为服务器确认的值:', myId)
  }

  // 清除旧对手
  opponents.forEach((mesh, id) => {
    console.log('移除旧对手:', id)
    scene.remove(mesh)
  })
  opponents.clear()

  let hasOpponent = false

  // 处理玩家数据
  if (data.players && Array.isArray(data.players)) {
    console.log('玩家数量:', data.players.length)

    data.players.forEach((p: any, index: number) => {
      console.log(`玩家 ${index}:`, p)
      console.log(`  我的ID: ${myId}`)
      console.log(`  这个玩家ID: ${p.id}`)
      console.log(`  是否是我: ${p.id === myId}`)

      // 只添加不是自己的玩家
      if (p.id !== myId) {
        console.log('✅✅✅ 这是对手！添加到场景')
        debugInfo.value.opponentId = p.id
        debugInfo.value.opponentTeam = p.team
        addOpponent(p.id, p.team, p.position)
        hasOpponent = true
      } else {
        console.log('这是我自己，设置我的位置')
        if (p.position) {
          player.position.set(p.position.x, p.position.y + 1.6, p.position.z)
          console.log('我的位置:', player.position)
        }
      }
    })
  }

  debugInfo.value.opponentCount = opponents.size

  if (!hasOpponent) {
    console.error('❌ 没有找到对手！')
    alert('调试：没有找到对手！\n我的ID: ' + myId + '\n游戏数据：' + JSON.stringify(data, null, 2))
  } else {
    console.log('✅ 对手添加成功，数量:', opponents.size)

    // 启动定期检查（每秒检查一次，持续5秒）
    if (opponentCheckInterval) clearInterval(opponentCheckInterval)
    let checkCount = 0
    opponentCheckInterval = window.setInterval(() => {
      checkCount++
      console.log(`🔍 定期检查 [${checkCount}/5]: 场景中对手数量 = ${opponents.size}`)

      // 如果场景中对手数量为0但应该有对手，尝试重新添加
      if (opponents.size === 0 && data.players && data.players.length >= 2) {
        console.log('⚠️ 检测到对手丢失，尝试重新添加...')
        data.players.forEach((p: any) => {
          if (p.id !== myId) {
            console.log('重新添加对手:', p.id)
            addOpponent(p.id, p.team, p.position)
          }
        })
      }

      // 5秒后停止检查
      if (checkCount >= 5) {
        clearInterval(opponentCheckInterval!)
        opponentCheckInterval = null
        console.log('✅ 定期检查结束')
      }
    }, 1000)
  }
}

networkManager.on('gameStart', (data: any) => {
  console.log('🎮 GameCanvasNetwork 收到 gameStart 事件！')
  console.log('当前 scene 是否存在:', !!scene)
  console.log('当前 opponents 数量:', opponents.size)
  handleGameStart(data)
})

networkManager.on('playerUpdate', (data: any) => {
  console.log('对手移动:', data.id, data.position)
  updateOpponent(data.id, data.position, data.rotation)
})

onMounted(() => {
  if (!containerRef.value) return

  console.log('🎮 初始化网络对战场景')
  console.log('我的 Socket ID:', networkManager.getSocketId())
  console.log('当前 myId:', myId)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0F0F23)

  const aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
  camera.position.set(0, 2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  containerRef.value.appendChild(renderer.domElement)

  createMap()

  player = {
    position: new THREE.Vector3(0, 1.6, 0),
    rotation: new THREE.Euler(0, 0, 0)
  }

  setupInput()

  console.log('✅ 网络对战场景初始化完成')
  console.log('调试信息:', debugInfo.value)

  // 检查是否已经有游戏数据（竞态条件处理）
  // 延迟检查，确保所有事件监听器都已设置
  setTimeout(() => {
    console.log('🔍 检查是否有已有游戏数据...')
    const existingGameData = (networkManager as any).getLastGameStartData?.()
    console.log('已有游戏数据:', existingGameData ? '是' : '否')
    if (existingGameData) {
      console.log('🔄 发现已有游戏数据，立即初始化')
      console.log('现有数据:', JSON.stringify(existingGameData, null, 2))
      handleGameStart(existingGameData)
    } else {
      console.log('⏳ 等待游戏开始事件...')
    }
  }, 100)


  const animate = (time: number) => {
    animationId = requestAnimationFrame(animate)
    updatePlayerMovement()
    camera.position.copy(player.position)
    camera.rotation.order = 'YXZ'
    camera.rotation.y = yaw
    camera.rotation.x = pitch

    if (time - lastUpdateTime > NETWORK_UPDATE_RATE) {
      networkManager.updatePosition(
        { x: player.position.x, y: player.position.y, z: player.position.z },
        { x: 0, y: yaw, z: pitch }
      )
      lastUpdateTime = time
    }

    renderer.render(scene, camera)
  }
  animate(0)

  const handleResize = () => {
    if (!containerRef.value) return
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  window.addEventListener('resize', handleResize)
})

function createMap() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 10)
  scene.add(directionalLight)

  const pointLight1 = new THREE.PointLight(0x7C3AED, 1, 20)
  pointLight1.position.set(-10, 10, -10)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0xF43F5E, 1, 20)
  pointLight2.position.set(10, 10, 10)
  scene.add(pointLight2)

  const groundGeometry = new THREE.PlaneGeometry(30, 30)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2A2A4E,
    roughness: 0.7
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  const obstacleMaterial = new THREE.MeshStandardMaterial({
    color: 0x1F4788,
    roughness: 0.5
  })

  const obstaclePositions = [
    { x: 0, z: -5, width: 3, height: 2, depth: 3 },
    { x: -5, z: 5, width: 2, height: 1.5, depth: 2 },
    { x: 5, z: 5, width: 2, height: 1.5, depth: 2 }
  ]

  obstaclePositions.forEach(pos => {
    const geometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth)
    const obstacle = new THREE.Mesh(geometry, obstacleMaterial)
    obstacle.position.set(pos.x, pos.height / 2, pos.z)
    scene.add(obstacle)
  })

  console.log('✅ 地图创建完成')
}

function setupInput() {
  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'KeyW': keys.forward = true; break
      case 'KeyS': keys.backward = true; break
      case 'KeyA': keys.left = true; break
      case 'KeyD': keys.right = true; break
    }
  })

  document.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW': keys.forward = false; break
      case 'KeyS': keys.backward = false; break
      case 'KeyA': keys.left = false; break
      case 'KeyD': keys.right = false; break
    }
  })

  document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === containerRef.value) {
      yaw -= e.movementX * MOUSE_SENSITIVITY
      pitch -= e.movementY * MOUSE_SENSITIVITY
      pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch))
    }
  })

  containerRef.value?.addEventListener('click', () => {
    containerRef.value?.requestPointerLock()
  })
}

function updatePlayerMovement() {
  const direction = new THREE.Vector3()

  if (keys.forward) direction.z -= 1
  if (keys.backward) direction.z += 1
  if (keys.left) direction.x -= 1
  if (keys.right) direction.x += 1

  direction.normalize()
  direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)

  player.position.x += direction.x * PLAYER_SPEED
  player.position.z += direction.z * PLAYER_SPEED

  const halfSize = 15
  player.position.x = Math.max(-halfSize, Math.min(halfSize, player.position.x))
  player.position.z = Math.max(-halfSize, Math.min(halfSize, player.position.z))
}

function addOpponent(id: string, team: 'blue' | 'red', position: any) {
  console.log('==========')
  console.log('添加对手函数被调用')
  console.log('对手ID:', id)
  console.log('队伍:', team)
  console.log('位置:', position)
  console.log('==========')

  if (opponents.has(id)) {
    console.log('对手已存在，先移除')
    scene.remove(opponents.get(id)!)
  }

  const group = new THREE.Group()

  // 身体（更小）
  const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.6)
  const bodyColor = team === 'blue' ? 0x3B82F6 : 0xEF4444
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    emissive: bodyColor,
    emissiveIntensity: 0.8,
    roughness: 0.2
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 0.6 // 身体高度的一半
  group.add(body)

  // 头部（更小）
  const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4)
  const headMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    emissive: bodyColor,
    emissiveIntensity: 1
  })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 1.4 // 身体高度 + 头部一半
  group.add(head)

  const light = new THREE.PointLight(bodyColor, 3, 15)
  light.position.set(0, 0.8, 0)
  group.add(light)

  // 让人物着地（y=0）
  group.position.set(position.x, 0, position.z)

  scene.add(group)
  opponents.set(id, group)

  console.log('✅ 对手添加到场景')
  console.log('对手位置:', group.position)
  console.log('相机位置:', camera.position)
  console.log('两者距离:', camera.position.distanceTo(group.position))
  console.log('场景中的对象数量:', scene.children.length)
  console.log('==========')
}

function updateOpponent(id: string, position: any, rotation: any) {
  const opponent = opponents.get(id)
  if (opponent) {
    // 让对手始终着地，y=0
    opponent.position.set(position.x, 0, position.z)
    if (rotation) {
      opponent.rotation.y = rotation.y || 0
    }
  }
}

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
  if (opponentCheckInterval) {
    clearInterval(opponentCheckInterval)
  }
  networkManager.disconnect()
})

defineExpose({
  addOpponent,
  updateOpponent,
  debugInfo
})
</script>

<template>
  <div ref="containerRef" class="game-canvas">
    <!-- Three.js canvas -->
  </div>

  <!-- 调试面板 -->
  <div class="debug-panel">
    <div class="debug-title">🐛 调试面板</div>
    <div class="debug-item">
      <span class="debug-label">连接:</span>
      <span :class="debugInfo.connected ? 'success' : 'error'">
        {{ debugInfo.connected ? '✅' : '❌' }}
      </span>
    </div>
    <div class="debug-item">
      <span class="debug-label">匹配:</span>
      <span :class="debugInfo.matched ? 'success' : 'error'">
        {{ debugInfo.matched ? '✅' : '❌' }}
      </span>
    </div>
    <div class="debug-item">
      <span class="debug-label">我的ID:</span>
      <span class="debug-value">{{ debugInfo.myId ? debugInfo.myId.substring(0, 8) + '...' : '未知' }}</span>
    </div>
    <div class="debug-item">
      <span class="debug-label">队伍:</span>
      <span class="debug-value">{{ debugInfo.myTeam || '未知' }}</span>
    </div>
    <div class="debug-item">
      <span class="debug-label">对手数量:</span>
      <span class="debug-value">{{ debugInfo.opponentCount }}</span>
    </div>
    <div class="debug-item">
      <span class="debug-label">对手ID:</span>
      <span class="debug-value">{{ debugInfo.opponentId ? debugInfo.opponentId.substring(0, 8) + '...' : '无' }}</span>
    </div>
    <div class="debug-item">
      <span class="debug-label">对手队伍:</span>
      <span class="debug-value">{{ debugInfo.opponentTeam || '无' }}</span>
    </div>
    <div class="debug-hint">
      打开控制台查看详细日志
    </div>
  </div>
</template>

<style scoped>
.game-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
}

.debug-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #7C3AED;
  padding: 1rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.85rem;
  z-index: 100;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.8);
}

.debug-title {
  color: #7C3AED;
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: bold;
  border-bottom: 1px solid #7C3AED;
  padding-bottom: 0.5rem;
}

.debug-item {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.debug-label {
  color: #A78BFA;
}

.debug-value {
  color: #E2E8F0;
}

.success {
  color: #22c55e;
  font-weight: bold;
}

.error {
  color: #EF4444;
  font-weight: bold;
}

.debug-hint {
  margin-top: 1rem;
  color: #F59E0B;
  font-size: 0.8rem;
  border-top: 1px solid #F59E0B;
  padding-top: 0.5rem;
}
</style>
