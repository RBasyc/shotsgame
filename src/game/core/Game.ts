/**
 * 游戏核心类型定义
 */

import * as THREE from 'three';

/**
 * 玩家状态
 */
export interface PlayerState {
  id: string;
  team: 'blue' | 'red';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  health: number;
  score: number;
  isDead: boolean;
}

/**
 * 游戏状态
 */
export interface GameState {
  isPlaying: boolean;
  isMatched: boolean;
  roomId: string | null;
  myTeam: 'blue' | 'red' | null;
  players: Map<string, PlayerState>;
  myHealth: number;
  myScore: number;
  opponentScore: number;
}

/**
 * 输入状态
 */
export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}

/**
 * 游戏配置
 */
export const GAME_CONFIG = {
  // 玩家配置
  PLAYER_HEIGHT: 2,
  PLAYER_SPEED: 0.15,
  MOUSE_SENSITIVITY: 0.002,

  // 武器配置
  WEAPON_DAMAGE: 34,
  FIRE_RATE: 300, // ms

  // 游戏规则
  MAX_HEALTH: 100,
  WIN_SCORE: 5,
  RESPAWN_TIME: 2000, // ms

  // 地图配置
  MAP_SIZE: 30,
  WALL_HEIGHT: 5,

  // 网络配置
  NETWORK_UPDATE_RATE: 50, // ms (20Hz)
} as const;

/**
 * 颜色配置（Retro-Futurism 风格）
 */
export const COLORS = {
  primary: 0x7C3AED,     // 紫色（主色）
  secondary: 0xA78BFA,   // 浅紫色
  cta: 0xF43F5E,         // 玫瑰红（CTA）
  background: 0x0F0F23,  // 深蓝黑背景
  text: 0xE2E8F0,        // 亮灰色文本

  // 玩家颜色
  blueTeam: 0x3B82F6,    // 蓝队
  redTeam: 0xEF4444,     // 红队

  // 环境颜色
  ground: 0x1A1A2E,      // 地面
  wall: 0x16213E,        // 墙壁
  obstacle: 0x0F3460,    // 障碍物

  // 准星颜色
  crosshair: 0x00FF00,   // 绿色
  crosshairHit: 0xFF0000, // 红色（击中时）
} as const;
