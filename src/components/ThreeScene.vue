<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

const containerRef = ref<HTMLDivElement>()
let animationId: number
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let cube: THREE.Mesh

onMounted(() => {
  if (!containerRef.value) return

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)

  // 创建相机
  const aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
  camera.position.z = 5

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  containerRef.value.appendChild(renderer.domElement)

  // 创建几何体和材质
  const geometry = new THREE.BoxGeometry(2, 2, 2)
  const material = new THREE.MeshStandardMaterial({
    color: 0x6366f1,
    metalness: 0.7,
    roughness: 0.3
  })
  cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 1)
  pointLight.position.set(5, 5, 5)
  scene.add(pointLight)

  // 动画循环
  const animate = () => {
    animationId = requestAnimationFrame(animate)

    // 旋转立方体
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    renderer.render(scene, camera)
  }
  animate()

  // 处理窗口大小变化
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
  <div ref="containerRef" class="three-container"></div>
</template>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
