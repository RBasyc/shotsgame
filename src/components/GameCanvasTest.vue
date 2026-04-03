<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const containerRef = ref<HTMLDivElement>()
let animationId: number
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let opponent: THREE.Group

onMounted(() => {
  if (!containerRef.value) return

  console.log('🎮 初始化测试场景')

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0F0F23)

  const aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
  camera.position.set(0, 2, 10) // 从远处看

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  containerRef.value.appendChild(renderer.domElement)

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 5)
  scene.add(directionalLight)

  // 添加地面
  const groundGeometry = new THREE.PlaneGeometry(30, 30)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2A2A4E,
    roughness: 0.7
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  // 创建测试对手模型
  createTestOpponent()

  console.log('✅ 测试场景创建完成')

  const animate = () => {
    animationId = requestAnimationFrame(animate)

    // 让对手旋转
    if (opponent) {
      opponent.rotation.y += 0.01
    }

    renderer.render(scene, camera)
  }
  animate()

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

function createTestOpponent() {
  opponent = new THREE.Group()

  // 身体 - 超大红色立方体
  const bodyGeometry = new THREE.BoxGeometry(3, 4, 2)
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xFF0000,
    emissive: 0xFF0000,
    emissiveIntensity: 1,
    roughness: 0.2
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 2
  opponent.add(body)

  // 头部 - 超大
  const headGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xFF0000,
    emissive: 0xFF0000,
    emissiveIntensity: 1
  })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 4.5
  opponent.add(head)

  // 添加强光源
  const light = new THREE.PointLight(0xFF0000, 3, 20)
  light.position.set(0, 2, 0)
  opponent.add(light)

  // 设置位置
  opponent.position.set(0, 0, 0)

  scene.add(opponent)
  console.log('✅ 添加测试对手 - 超大红色立方体')
  console.log('对手位置:', opponent.position)
}

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<template>
  <div ref="containerRef" class="game-canvas">
    <!-- Three.js canvas -->
  </div>

  <!-- 测试提示 -->
  <div class="test-info">
    <div class="test-title">🧪 测试模式</div>
    <div class="test-text">
      如果你能看到一个<span style="color: #FF0000; font-weight: bold;"> 超大旋转的红色立方体</span>，说明 Three.js 正常工作
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
}

.test-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  z-index: 100;
  pointer-events: none;
}

.test-title {
  color: #7C3AED;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px #7C3AED;
}

.test-text {
  color: #E2E8F0;
  font-size: 1rem;
  line-height: 1.6;
}
</style>
