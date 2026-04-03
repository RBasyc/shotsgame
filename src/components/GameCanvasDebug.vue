<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { SimpleNetworkManager } from '../game/core/SimpleNetwork'

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
const FIRE_RATE = 300
const NETWORK_UPDATE_RATE = 50
let lastUpdateTime = 0
const raycaster = new THREE.Raycaster()

const networkManager = new SimpleNetworkManager()

// 监听匹配事件
networkManager.on('matchFound', (data: any) => {
  console.log('匹配成功！', data)
  myTeam = data.team
})

networkManager.on('gameStart', (data: any) => {
  console.log('游戏开始！', data)

  // 清除旧对手
  opponents.forEach(mesh => scene.remove(mesh))
  opponents.clear()

  // 添加对手（服务器发送所有玩家，我需要找到对手）
  if (data.players && Array.isArray(data.players)) {
    data.players.forEach((p: any) => {
      // p.id 是 socket ID，格式如 "xxx..."
      // 我们通过 team 来区分，自己不添加
      if (p.team !== myTeam) {
        console.log('添加对手:', p.id, p.team, p.position)
        addOpponent(p.id, p.team, p.position)
      } else {
        console.log('这是我的队伍:', myTeam, '我的ID应该是其他玩家')
        // 设置我的位置
        if (p.position) {
          player.position.set(p.position.x, p.position.y + 2, p.position.z)
        }
      }
    })
  }
})

networkManager.on('playerUpdate', (data: any) => {
  updateOpponent(data.id, data.position, data.rotation)
})

networkManager.on('respawn', (data: any) => {
  player.position.set(data.position.x, data.position.y + 2, data.position.z)
})

onMounted(() => {
  if (!containerRef.value) return

  console.log('🎮 初始化对战场景')

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
    position: new THREE.Vector3(0, 2, 0),
    rotation: new THREE.Euler(0, 0, 0)
  }

  setupInput()

  console.log('✅ 对战场景初始化完成')

  // 添加测试对手（临时）
  setTimeout(() => {
    addOpponent('test_opponent', 'red', { x: 5, y: 0, z: 0 })
  }, 1000)

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
    roughness: 0.7,
    emissive: 0x1A1A2E,
    emissiveIntensity: 0.2
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const obstacleMaterial = new THREE.MeshStandardMaterial({
    color: 0x1F4788,
    roughness: 0.5,
    emissive: 0x1F4788,
    emissiveIntensity: 0.3
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
    obstacle.castShadow = true
    obstacle.receiveShadow = true
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

  containerRef.value?.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      shoot()
    }
  })

  console.log('✅ 输入控制设置完成')
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

function shoot() {
  console.log('🔫 射击！')
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)
  const opponentMeshes = Array.from(opponents.values()).flatMap(group => group.children)
  const intersects = raycaster.intersectObjects(opponentMeshes)

  if (intersects.length > 0) {
    console.log('✅ 击中对手！', intersects[0].object)
    for (const [id, group] of opponents.entries()) {
      if (group.children.includes(intersects[0].object)) {
        networkManager.shoot(id)
        break
      }
    }
  }
}

function addOpponent(id: string, team: 'blue' | 'red', position: any) {
  console.log('添加对手:', id, team, position)

  if (opponents.has(id)) {
    scene.remove(opponents.get(id)!)
  }

  const group = new THREE.Group()

  // 超大身体
  const bodyGeometry = new THREE.BoxGeometry(3, 4, 2)
  const bodyColor = team === 'blue' ? 0x3B82F6 : 0xEF4444
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    emissive: bodyColor,
    emissiveIntensity: 0.8,
    roughness: 0.2
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 2
  body.castShadow = true
  group.add(body)

  // 超大头
  const headGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
  const headMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    emissive: bodyColor,
    emissiveIntensity: 1
  })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 4.5
  head.castShadow = true
  group.add(head)

  // 添加点光源
  const light = new THREE.PointLight(bodyColor, 3, 15)
  light.position.set(0, 2, 0)
  group.add(light)

  group.position.set(position.x, position.y || 1, position.z)

  scene.add(group)
  opponents.set(id, group)

  console.log('对手位置:', group.position)
  console.log('相机位置:', camera.position)
  console.log('两者距离:', camera.position.distanceTo(group.position))
}

function updateOpponent(id: string, position: any, rotation: any) {
  const opponent = opponents.get(id)
  if (opponent) {
    opponent.position.set(position.x, position.y || 1, position.z)
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
  networkManager.disconnect()
  console.log('✅ 资源已清理')
})

defineExpose({
  addOpponent,
  updateOpponent,
  isPointerLocked: () => document.pointerLockElement === containerRef.value
})
</script>

<template>
  <div ref="containerRef" class="game-canvas">
    <!-- Three.js canvas -->
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
</style>
