/**
 * 网络管理类
 * 处理与 Socket.io 服务器的通信
 */

import { io, Socket } from 'socket.io-client';
import { PlayerState } from './Game';

type EventCallback = (...args: any[]) => void;

export class NetworkManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private callbacks = new Map<string, EventCallback[]>();

  constructor() {
    this.connect();
  }

  /**
   * 连接到服务器
   */
  connect() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('已连接到服务器');
      this.isConnected = true;
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('与服务器断开连接');
      this.isConnected = false;
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('连接错误:', error);
    });

    // 设置默认事件监听器
    this.setupDefaultListeners();
  }

  /**
   * 设置默认事件监听器
   */
  private setupDefaultListeners() {
    if (!this.socket) return;

    // 等待匹配
    this.socket.on('waiting', (data) => {
      this.emit('waiting', data);
    });

    // 匹配成功
    this.socket.on('matchFound', (data) => {
      console.log('匹配成功:', data);
      this.emit('matchFound', data);
    });

    // 游戏开始
    this.socket.on('gameStart', (data) => {
      console.log('游戏开始');
      this.emit('gameStart', data);
    });

    // 玩家更新
    this.socket.on('playerUpdate', (data) => {
      this.emit('playerUpdate', data);
    });

    // 击中确认
    this.socket.on('hitConfirmed', (data) => {
      this.emit('hitConfirmed', data);
    });

    // 受到伤害
    this.socket.on('takeDamage', (data) => {
      this.emit('takeDamage', data);
    });

    // 击杀
    this.socket.on('kill', (data) => {
      this.emit('kill', data);
    });

    // 死亡
    this.socket.on('death', (data) => {
      this.emit('death', data);
    });

    // 玩家被击杀
    this.socket.on('playerKilled', (data) => {
      this.emit('playerKilled', data);
    });

    // 重生
    this.socket.on('respawn', (data) => {
      this.emit('respawn', data);
    });

    // 对手重生
    this.socket.on('playerRespawn', (data) => {
      this.emit('playerRespawn', data);
    });

    // 游戏结束
    this.socket.on('gameOver', (data) => {
      console.log('游戏结束:', data);
      this.emit('gameOver', data);
    });

    // 对手断开
    this.socket.on('opponentDisconnected', () => {
      console.log('对手断开连接');
      this.emit('opponentDisconnected');
    });

    // 匹配取消
    this.socket.on('matchCancelled', () => {
      this.emit('matchCancelled');
    });
  }

  /**
   * 发送事件到服务器
   */
  send(event: string, data?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('未连接到服务器，无法发送事件:', event);
    }
  }

  /**
   * 寻找对战
   */
  findMatch() {
    this.send('findMatch');
  }

  /**
   * 取消匹配
   */
  cancelMatch() {
    this.send('cancelMatch');
  }

  /**
   * 更新玩家位置
   */
  updatePosition(position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }) {
    this.send('updatePosition', { position, rotation });
  }

  /**
   * 射击
   */
  shoot(targetId: string) {
    this.send('shoot', { targetId });
  }

  /**
   * 添加事件监听器
   */
  on(event: string, callback: EventCallback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  /**
   * 移除事件监听器
   */
  off(event: string, callback: EventCallback) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件回调
   */
  private emit(event: string, ...args: any[]) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * 检查是否已连接
   */
  isServerConnected(): boolean {
    return this.isConnected;
  }
}
