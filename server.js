/**
 * ShotsGame - Socket.io 服务器
 * 处理 1v1 实时对战的游戏逻辑
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// 游戏房间管理
const rooms = new Map(); // roomId -> { players: {}, gameStarted: bool, hostId: string }

/**
 * 玩家类
 */
class Player {
  constructor(id, socket) {
    this.id = id;
    this.socket = socket;
    this.roomId = null;
    this.health = 100;
    this.score = 0;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.isDead = false;
    this.team = null; // 'blue' or 'red'
  }
}

/**
 * 开始游戏
 */
function startGame(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  // 检查是否有两个玩家
  const players = Object.values(room.players);
  if (players.length !== 2) {
    console.log(`房间 ${roomId} 玩家数量不足，无法开始游戏`);
    return;
  }

  room.gameStarted = true;

  // 分配队伍
  players[0].team = 'blue';
  players[1].team = 'red';

  // 设置初始位置（蓝队在左侧，红队在右侧）
  players[0].position = { x: -10, y: 0, z: 0 };
  players[1].position = { x: 10, y: 0, z: 0 };

  // 通知所有玩家游戏开始
  io.to(roomId).emit('gameStart', {
    players: players.map(p => ({
      id: p.id,
      team: p.team,
      position: p.position,
      health: p.health,
      score: p.score
    }))
  });

  console.log(`房间 ${roomId} 游戏开始！`);
}

/**
 * 玩家重生
 */
function respawnPlayer(player) {
  player.health = 100;
  player.isDead = false;

  // 回到队伍基地
  if (player.team === 'blue') {
    player.position = { x: -10, y: 0, z: 0 };
  } else {
    player.position = { x: 10, y: 0, z: 0 };
  }

  // 通知玩家重生
  player.socket.emit('respawn', {
    position: player.position,
    health: player.health
  });

  // 通知房间内其他玩家
  const room = rooms.get(player.roomId);
  if (room) {
    player.socket.to(player.roomId).emit('playerRespawn', {
      id: player.id,
      position: player.position
    });
  }
}

/**
 * 检查胜利条件
 */
function checkWin(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const players = Object.values(room.players);
  for (const player of players) {
    if (player.score >= 5) {
      return player;
    }
  }
  return null;
}

/**
 * Socket.io 连接处理
 */
io.on('connection', (socket) => {
  console.log(`玩家连接: ${socket.id}`);

  // 创建玩家对象
  const player = new Player(socket.id, socket);

  /**
   * 创建房间
   */
  socket.on('createRoom', () => {
    // 生成6位房间码
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 创建新房间
    rooms.set(roomId, {
      players: {},
      gameStarted: false,
      hostId: socket.id
    });

    // 将玩家加入房间
    const room = rooms.get(roomId);
    room.players[socket.id] = player;
    player.roomId = roomId;

    socket.join(roomId);

    console.log(`玩家 ${socket.id} 创建房间 ${roomId}`);

    // 通知玩家房间创建成功
    socket.emit('roomCreated', { roomId });
  });

  /**
   * 加入房间
   */
  socket.on('joinRoom', (data) => {
    const { roomId } = data;

    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('joinError', { message: '房间不存在' });
      console.log(`玩家 ${socket.id} 尝试加入不存在的房间 ${roomId}`);
      return;
    }

    if (room.gameStarted) {
      socket.emit('joinError', { message: '游戏已经开始' });
      console.log(`玩家 ${socket.id} 尝试加入已开始的房间 ${roomId}`);
      return;
    }

    if (Object.keys(room.players).length >= 2) {
      socket.emit('joinError', { message: '房间已满' });
      console.log(`玩家 ${socket.id} 尝试加入已满的房间 ${roomId}`);
      return;
    }

    // 加入房间
    room.players[socket.id] = player;
    player.roomId = roomId;
    socket.join(roomId);

    console.log(`玩家 ${socket.id} 加入房间 ${roomId}`);

    // 通知玩家加入成功
    socket.emit('roomJoined', { roomId });

    // 通知房间内其他玩家
    socket.to(roomId).emit('playerJoined', { playerId: socket.id });

    // 如果房间满了，开始游戏
    if (Object.keys(room.players).length === 2) {
      console.log(`房间 ${roomId} 已满，准备开始游戏`);

      // 通知双方
      io.to(roomId).emit('matchFound', { roomId });

      // 延迟1秒后开始游戏，给客户端准备时间
      setTimeout(() => {
        startGame(roomId);
      }, 1000);
    }
  });

  /**
   * 更新玩家位置和朝向
   */
  socket.on('updatePosition', (data) => {
    if (!player.roomId) return;

    player.position = data.position;
    player.rotation = data.rotation;

    // 广播给房间内其他玩家
    socket.to(player.roomId).emit('playerUpdate', {
      id: socket.id,
      position: player.position,
      rotation: player.rotation
    });
  });

  /**
   * 玩家射击
   */
  socket.on('shoot', (data) => {
    if (!player.roomId || player.isDead) return;

    const room = rooms.get(player.roomId);
    if (!room) return;

    // 找到目标玩家
    const targetId = data.targetId;
    const target = Object.values(room.players).find(p => p.id === targetId);

    if (target && !target.isDead) {
      // 造成伤害
      target.health -= 34;

      // 通知击中
      socket.emit('hitConfirmed', { targetId, damage: 34 });
      target.socket.emit('takeDamage', {
        from: socket.id,
        damage: 34,
        health: target.health
      });

      // 检查是否击杀
      if (target.health <= 0) {
        target.isDead = true;
        player.score++;

        // 通知击杀
        socket.emit('kill', { score: player.score });
        target.socket.emit('death', { killer: socket.id });

        // 广播击杀信息
        io.to(player.roomId).emit('playerKilled', {
          killer: socket.id,
          victim: targetId,
          score: player.score
        });

        // 检查胜利
        const winner = checkWin(player.roomId);
        if (winner) {
          io.to(player.roomId).emit('gameOver', {
            winner: winner.id,
            winnerTeam: winner.team
          });
        } else {
          // 重生目标
          setTimeout(() => respawnPlayer(target), 2000);
        }
      }
    }
  });

  /**
   * 玩家断开连接
   */
  socket.on('disconnect', () => {
    console.log(`玩家断开: ${socket.id}`);

    // 从等待队列移除
    const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1);
    }

    // 处理房间中的玩家
    if (player.roomId) {
      const room = rooms.get(player.roomId);
      if (room) {
        // 通知对手
        socket.to(player.roomId).emit('opponentDisconnected');

        // 删除房间
        rooms.delete(player.roomId);
      }
    }
  });

  /**
   * 取消匹配
   */
  socket.on('cancelMatch', () => {
    const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1);
      socket.emit('matchCancelled');
      console.log(`玩家 ${socket.id} 取消匹配`);
    }
  });
});

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(``);
  console.log(`🎮 ShotsGame 服务器运行在端口 ${PORT}`);
  console.log(`📍 WebSocket: ws://localhost:${PORT}`);
  console.log(``);
});
