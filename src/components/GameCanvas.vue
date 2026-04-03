<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { InputManager } from '../game/utils/Input';
import { AudioManager } from '../game/utils/Audio';
import { NetworkManager } from '../game/core/Network';
import { GAME_CONFIG, COLORS, PlayerState } from '../game/core/Game';

// Props
interface Props {
  gameActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  gameActive: false,
});

// Emits
const emit = defineEmits<{
  gameStart: [data: any];
  playerUpdate: [data: any];
  takeDamage: [data: any];
  kill: [data: any];
  death: [data: any];
  playerKilled: [data: any];
  gameOver: [data: any];
  opponentDisconnected: [];
  healthChange: [health: number];
  scoreChange: [score: number];
}>();

// Refs
const containerRef = ref<HTMLDivElement>();
let animationId: number;

// Three.js 核心对象
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

// 游戏对象
let player: {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  canShoot: boolean;
  health: number;
  score: number;
};

let opponent: THREE.Mesh | null = null;
let opponents: Map<string, THREE.Mesh> = new Map();
let obstacles: THREE.Mesh[] = [];
let walls: THREE.Mesh[] = [];

// 管理器
let inputManager: InputManager;
let audioManager: AudioManager;
let networkManager: NetworkManager;

// 相机控制
let pitch = 0;
let yaw = 0;

// 射线检测
let raycaster: THREE.Raycaster;
let crosshairState: 'normal' | 'hit' = 'normal';

/**
 * 初始化 Three.js 场景
 */
function initScene() {
  if (!containerRef.value) return;

  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.background);
  scene.fog = new THREE.Fog(COLORS.background, 10, 50);

  // 创建相机
  const aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.set(0, GAME_CONFIG.PLAYER_HEIGHT, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  containerRef.value.appendChild(renderer.domElement);

  // 创建光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // 创建地图
  createMap();

  // 初始化射线
  raycaster = new THREE.Raycaster();
}

/**
 * 创建地图
 */
function createMap() {
  // 地面
  const groundGeometry = new THREE.PlaneGeometry(GAME_CONFIG.MAP_SIZE, GAME_CONFIG.MAP_SIZE);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.ground,
    roughness: 0.8,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 墙壁
  createWalls();

  // 障碍物
  createObstacles();
}

/**
 * 创建墙壁
 */
function createWalls() {
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.wall,
    roughness: 0.7,
  });

  const halfSize = GAME_CONFIG.MAP_SIZE / 2;
  const height = GAME_CONFIG.WALL_HEIGHT;
  const thickness = 1;

  // 四面墙
  const wallConfigs = [
    { pos: [0, height / 2, -halfSize], size: [GAME_CONFIG.MAP_SIZE, height, thickness] },
    { pos: [0, height / 2, halfSize], size: [GAME_CONFIG.MAP_SIZE, height, thickness] },
    { pos: [-halfSize, height / 2, 0], size: [thickness, height, GAME_CONFIG.MAP_SIZE] },
    { pos: [halfSize, height / 2, 0], size: [thickness, height, GAME_CONFIG.MAP_SIZE] },
  ];

  wallConfigs.forEach(config => {
    const geometry = new THREE.BoxGeometry(...config.size);
    const wall = new THREE.Mesh(geometry, wallMaterial);
    wall.position.set(...config.pos);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    walls.push(wall);
  });

  // 基地标示
  const blueBaseGeom = new THREE.CylinderGeometry(2, 2, 0.1, 32);
  const blueBaseMat = new THREE.MeshStandardMaterial({ color: COLORS.blueTeam, emissive: COLORS.blueTeam, emissiveIntensity: 0.5 });
  const blueBase = new THREE.Mesh(blueBaseGeom, blueBaseMat);
  blueBase.position.set(-10, 0.05, 0);
  scene.add(blueBase);

  const redBaseGeom = new THREE.CylinderGeometry(2, 2, 0.1, 32);
  const redBaseMat = new THREE.MeshStandardMaterial({ color: COLORS.redTeam, emissive: COLORS.redTeam, emissiveIntensity: 0.5 });
  const redBase = new THREE.Mesh(redBaseGeom, redBaseMat);
  redBase.position.set(10, 0.05, 0);
  scene.add(redBase);
}

/**
 * 创建障碍物
 */
function createObstacles() {
  const obstacleMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.obstacle,
    roughness: 0.6,
  });

  // 创建多个障碍物作为掩体
  const obstaclePositions = [
    { x: 0, z: 0, width: 3, height: 2, depth: 3 },
    { x: -5, z: 5, width: 2, height: 1.5, depth: 2 },
    { x: 5, z: -5, width: 2, height: 1.5, depth: 2 },
    { x: -5, z: -5, width: 2, height: 1.5, depth: 2 },
    { x: 5, z: 5, width: 2, height: 1.5, depth: 2 },
  ];

  obstaclePositions.forEach(pos => {
    const geometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth);
    const obstacle = new THREE.Mesh(geometry, obstacleMaterial);
    obstacle.position.set(pos.x, pos.height / 2, pos.z);
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    scene.add(obstacle);
    obstacles.push(obstacle);
  });
}

/**
 * 创建对手模型
 */
function createOpponentMesh(opponentId: string, team: 'blue' | 'red'): THREE.Mesh {
  const group = new THREE.Group();

  // 身体
  const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: team === 'blue' ? COLORS.blueTeam : COLORS.redTeam,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.75;
  group.add(body);

  // 头部
  const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: team === 'blue' ? COLORS.blueTeam : COLORS.redTeam,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.75;
  group.add(head);

  scene.add(group);
  opponents.set(opponentId, group as any);

  return group as any;
}

/**
 * 更新对手位置
 */
function updateOpponent(opponentId: string, position: any, rotation: any) {
  let opponentMesh = opponents.get(opponentId);

  if (!opponentMesh) {
    // 需要知道队伍颜色，这里先用默认
    opponentMesh = createOpponentMesh(opponentId, 'red');
  }

  opponentMesh.position.set(position.x, position.y, position.z);
  opponentMesh.rotation.set(rotation.x, rotation.y, rotation.z);
}

/**
 * 初始化玩家
 */
function initPlayer() {
  player = {
    position: new THREE.Vector3(0, GAME_CONFIG.PLAYER_HEIGHT, 0),
    rotation: new THREE.Euler(0, 0, 0),
    velocity: new THREE.Vector3(),
    canShoot: true,
    health: GAME_CONFIG.MAX_HEALTH,
    score: 0,
  };
}

/**
 * 初始化输入
 */
function initInput() {
  inputManager = new InputManager();
  inputManager.init(containerRef.value!);

  inputManager.setMouseMoveCallback((movementX: number, movementY: number) => {
    if (!props.gameActive) return;

    yaw -= movementX * GAME_CONFIG.MOUSE_SENSITIVITY;
    pitch -= movementY * GAME_CONFIG.MOUSE_SENSITIVITY;

    // 限制俯仰角
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  });

  // 射击（鼠标点击）
  containerRef.value?.addEventListener('mousedown', (event) => {
    if (event.button === 0 && props.gameActive) { // 左键
      shoot();
    }
  });
}

/**
 * 更新玩家移动
 */
function updatePlayerMovement() {
  if (!props.gameActive) return;

  const input = inputManager.getInputState();
  const speed = GAME_CONFIG.PLAYER_SPEED;

  // 计算移动方向
  const direction = new THREE.Vector3();

  if (input.forward) direction.z -= 1;
  if (input.backward) direction.z += 1;
  if (input.left) direction.x -= 1;
  if (input.right) direction.x += 1;

  direction.normalize();

  // 根据相机朝向旋转移动方向
  direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

  // 更新位置
  player.position.x += direction.x * speed;
  player.position.z += direction.z * speed;

  // 限制在地图范围内
  const halfSize = GAME_CONFIG.MAP_SIZE / 2 - 1;
  player.position.x = Math.max(-halfSize, Math.min(halfSize, player.position.x));
  player.position.z = Math.max(-halfSize, Math.min(halfSize, player.position.z));

  // 更新相机位置
  camera.position.set(player.position.x, player.position.y, player.position.z);

  // 发送位置更新到服务器
  networkManager.updatePosition(
    { x: player.position.x, y: player.position.y, z: player.position.z },
    { x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z }
  );
}

/**
 * 射击
 */
function shoot() {
  if (!player.canShoot || !props.gameActive) return;

  player.canShoot = false;
  audioManager.playShoot();

  // 从相机位置发射射线
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

  // 检测是否击中对手
  const opponentMeshes = Array.from(opponents.values());
  const intersects = raycaster.intersectObjects(opponentMeshes, true);

  if (intersects.length > 0) {
    // 找到击中的对手
    const hitObject = intersects[0].object;
    let opponentId: string | null = null;

    for (const [id, mesh] of opponents.entries()) {
      if (mesh === hitObject || mesh.children.includes(hitObject)) {
        opponentId = id;
        break;
      }
    }

    if (opponentId) {
      networkManager.shoot(opponentId);
      crosshairState = 'hit';
      setTimeout(() => {
        crosshairState = 'normal';
      }, 100);
    }
  }

  // 射击冷却
  setTimeout(() => {
    player.canShoot = true;
  }, GAME_CONFIG.FIRE_RATE);
}

/**
 * 动画循环
 */
function animate() {
  animationId = requestAnimationFrame(animate);

  if (props.gameActive) {
    updatePlayerMovement();
  }

  renderer.render(scene, camera);
}

/**
 * 初始化音频
 */
async function initAudio() {
  audioManager = new AudioManager();
  await audioManager.init();
}

/**
 * 初始化网络
 */
function initNetwork() {
  networkManager = new NetworkManager();

  networkManager.on('gameStart', (data: any) => {
    console.log('游戏开始', data);
    emit('gameStart', data);
    audioManager.playGameStart();
  });

  networkManager.on('playerUpdate', (data: any) => {
    updateOpponent(data.id, data.position, data.rotation);
    emit('playerUpdate', data);
  });

  networkManager.on('takeDamage', (data: any) => {
    player.health = data.health;
    emit('takeDamage', data);
    emit('healthChange', player.health);
    audioManager.playDamage();
  });

  networkManager.on('kill', (data: any) => {
    player.score = data.score;
    emit('kill', data);
    emit('scoreChange', player.score);
    audioManager.playKill();
  });

  networkManager.on('death', (data: any) => {
    emit('death', data);
    audioManager.playDeath();
  });

  networkManager.on('playerKilled', (data: any) => {
    emit('playerKilled', data);
  });

  networkManager.on('respawn', (data: any) => {
    player.health = data.health;
    player.position.set(data.position.x, data.position.y, data.position.z);
    emit('healthChange', player.health);
  });

  networkManager.on('playerRespawn', (data: any) => {
    // 对手重生
  });

  networkManager.on('gameOver', (data: any) => {
    emit('gameOver', data);
  });

  networkManager.on('opponentDisconnected', () => {
    emit('opponentDisconnected');
  });
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
  if (!containerRef.value) return;

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// 暴露方法给父组件
defineExpose({
  findMatch: () => networkManager?.findMatch(),
  cancelMatch: () => networkManager?.cancelMatch(),
  isPointerLocked: () => inputManager?.isPointerLocked(),
});

onMounted(async () => {
  initScene();
  initPlayer();
  initInput();
  await initAudio();
  initNetwork();

  window.addEventListener('resize', handleResize);
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);

  if (renderer) {
    renderer.dispose();
  }

  inputManager?.cleanup();
  networkManager?.disconnect();

  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div ref="containerRef" class="game-canvas">
    <!-- Three.js canvas will be appended here -->
  </div>
</template>

<style scoped>
.game-canvas {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
