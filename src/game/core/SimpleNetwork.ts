/**
 * 简化版网络管理器 - Socket.io 客户端
 */

import { io, Socket } from 'socket.io-client'

type EventCallback = (...args: any[]) => void

export class SimpleNetworkManager {
  private socket: Socket | null = null
  private isConnected = false
  private callbacks = new Map<string, EventCallback[]>()
  private lastGameStartData: any = null // 存储最后一次 gameStart 数据

  constructor() {
    this.connect()
  }

  connect() {
    console.log('🔌 连接到 Socket.io 服务器...')

    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    })

    this.socket.on('connect', () => {
      console.log('✅ 已连接到服务器，Socket ID:', this.socket?.id)
      this.isConnected = true
      this.emit('connected', { socketId: this.socket?.id })
    })

    this.socket.on('disconnect', () => {
      console.log('❌ 与服务器断开连接')
      this.isConnected = false
      this.emit('disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('连接错误:', error)
    })

    this.setupEventListeners()
  }

  setupEventListeners() {
    if (!this.socket) return

    // 等待匹配
    this.socket.on('waiting', (data) => {
      console.log('⏳ 等待对手...', data)
      this.emit('waiting', data)
    })

    // 匹配成功
    this.socket.on('matchFound', (data) => {
      console.log('✅ 匹配成功！', data)
      this.emit('matchFound', data)
    })

    // 房间创建成功
    this.socket.on('roomCreated', (data) => {
      console.log('🏠 房间创建成功！', data)
      this.emit('roomCreated', data)
    })

    // 加入房间成功
    this.socket.on('roomJoined', (data) => {
      console.log('✅ 加入房间成功！', data)
      this.emit('roomJoined', data)
    })

    // 玩家加入房间
    this.socket.on('playerJoined', (data) => {
      console.log('👥 有玩家加入房间', data)
      this.emit('playerJoined', data)
    })

    // 加入房间错误
    this.socket.on('joinError', (data) => {
      console.error('❌ 加入房间失败:', data.message)
      this.emit('joinError', data)
    })

    // 游戏开始
    this.socket.on('gameStart', (data) => {
      console.log('🎮 游戏开始！', data)
      // 将当前socket ID附加到gameStart数据中
      data.mySocketId = this.socket?.id
      // 保存数据供后续查询
      this.lastGameStartData = data
      this.emit('gameStart', data)
    })

    // 玩家更新
    this.socket.on('playerUpdate', (data) => {
      this.emit('playerUpdate', data)
    })

    // 受到伤害
    this.socket.on('takeDamage', (data) => {
      console.log('💔 受到伤害！', data)
      this.emit('takeDamage', data)
    })

    // 击杀
    this.socket.on('kill', (data) => {
      console.log('🎯 击杀！', data)
      this.emit('kill', data)
    })

    // 死亡
    this.socket.on('death', (data) => {
      console.log('💀 死亡！', data)
      this.emit('death', data)
    })

    // 玩家被击杀
    this.socket.on('playerKilled', (data) => {
      console.log('☠️ 玩家被击杀', data)
      this.emit('playerKilled', data)
    })

    // 重生
    this.socket.on('respawn', (data) => {
      console.log('🔄 重生', data)
      this.emit('respawn', data)
    })

    // 对手重生
    this.socket.on('playerRespawn', (data) => {
      this.emit('playerRespawn', data)
    })

    // 游戏结束
    this.socket.on('gameOver', (data) => {
      console.log('🏁 游戏结束', data)
      this.emit('gameOver', data)
    })

    // 对手断开
    this.socket.on('opponentDisconnected', () => {
      console.log('⚠️ 对手断开连接')
      this.emit('opponentDisconnected')
    })

    // 匹配取消
    this.socket.on('matchCancelled', () => {
      this.emit('matchCancelled')
    })
  }

  // 发送事件到服务器
  send(event: string, data?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.warn('⚠️ 未连接到服务器，无法发送事件:', event)
    }
  }

  // 创建房间
  createRoom() {
    console.log('🏠 创建房间...')
    this.send('createRoom')
  }

  // 加入房间
  joinRoom(roomId: string) {
    console.log('🚪 加入房间:', roomId)
    this.send('joinRoom', { roomId })
  }

  // 寻找对战（已废弃，保留兼容性）
  findMatch() {
    console.log('⚠️ findMatch 已废弃，请使用 createRoom/joinRoom')
    this.send('findMatch')
  }

  // 取消匹配（已废弃，保留兼容性）
  cancelMatch() {
    console.log('⚠️ cancelMatch 已废弃')
    this.send('cancelMatch')
  }

  // 更新玩家位置
  updatePosition(position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }) {
    this.send('updatePosition', { position, rotation })
  }

  // 射击
  shoot(targetId: string) {
    console.log('🔫 发送射击事件，目标:', targetId)
    this.send('shoot', { targetId })
  }

  // 添加事件监听器
  on(event: string, callback: EventCallback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  // 移除事件监听器
  off(event: string, callback: EventCallback) {
    const callbacks = this.callbacks.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // 触发事件回调
  private emit(event: string, ...args: any[]) {
    const callbacks = this.callbacks.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(...args))
    }
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // 检查是否已连接
  isServerConnected(): boolean {
    return this.isConnected
  }

  // 获取自己的 Socket ID
  getSocketId(): string {
    return this.socket?.id || 'unknown'
  }

  // 获取最后一次 gameStart 数据
  getLastGameStartData(): any {
    return this.lastGameStartData
  }
}
