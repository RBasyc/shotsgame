# ShotsGame - 1v1 在线射击游戏
[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/RBasyc/shotsgame)
  <br>
一个基于 Web 的 1v1 第一人称射击游戏，类似《无畏契约》的简化版。使用 Three.js 实现 3D 渲染，Socket.io 实现实时对战。

## 技术栈

- **前端：** Vue 3 + TypeScript + Three.js + Socket.io-client
- **后端：** Node.js + Express + Socket.io
- **风格：** Retro-Futurism（复古未来主义）

## 游戏特性

- 🎮 **实时对战：** WebSocket 实时同步玩家位置和射击事件
- 🔫 **射击机制：** 3 枪击杀（每次 34 伤害）
- 🏆 **计分系统：** 先达到 5 分获胜
- 🎨 **复古风格：** CRT 扫描线、霓虹发光、Glitch 效果
- 🎵 **音效系统：** Web Audio API 生成复古游戏音效
- 📱 **移动端支持：** 触摸控制 + 横屏适配

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务器

```bash
# 方式 1: 同时启动前端和后端（推荐）
npm run dev:all

# 方式 2: 分别启动
npm run server  # 终端 1: 启动 Socket.io 服务器（端口 3000）
npm run dev     # 终端 2: 启动 Vite 开发服务器（端口 5173）
```

### 开始游戏

1. 打开浏览器访问 `http://localhost:5173`
2. 点击"寻找对战"按钮
3. 用另一个浏览器窗口/标签页打开同一地址
4. 等待自动匹配并开始对战！

## 游戏操作

### PC 端

- **WASD** - 移动角色
- **鼠标** - 瞄准（第一人称视角）
- **鼠标左键** - 射击
- **ESC** - 退出指针锁定

### 移动端

- **左侧虚拟摇杆** - 移动角色
- **右侧触摸拖动** - 瞄准
- **射击按钮** - 发射

## 游戏规则

- 每个玩家拥有 100 生命值
- 每次击中造成 34 伤害（3 枪击杀）
- 被击杀后在己方基地重生
- 先达到 5 分的玩家获胜

## 项目结构

```
shotsgame/
├── server.js                 # Socket.io 服务器
├── package.json              # 依赖配置
├── public/
│   └── index.html            # 游戏主页面
├── src/
│   ├── main.ts               # Vue 入口
│   ├── App.vue               # 根组件
│   ├── components/           # Vue 组件
│   │   ├── GameCanvas.vue    # Three.js 渲染画布
│   │   ├── GameHUD.vue       # 游戏界面
│   │   ├── GameMenu.vue      # 主菜单
│   │   ├── Crosshair.vue     # 准星
│   │   ├── KillFeed.vue      # 击杀提示
│   │   └── GameOver.vue      # 游戏结束
│   ├── game/                 # 游戏逻辑
│   │   ├── core/
│   │   │   ├── Game.ts       # 游戏核心类型
│   │   │   └── Network.ts    # 网络通信
│   │   └── utils/
│   │       ├── Audio.ts      # 音效系统
│   │       └── Input.ts      # 输入处理
│   └── styles/
│       └── game.css          # 游戏样式
```

## 局域网联机

### 1. 查找本机 IP

**Windows:**
```bash
ipconfig
```

**macOS/Linux:**
```bash
ifconfig
```

### 2. 修改服务器配置

编辑 `src/game/core/Network.ts`，将 `localhost` 改为本机 IP：

```typescript
this.socket = io('http://YOUR_IP:3000', {
  transports: ['websocket', 'polling'],
});
```

### 3. 启动服务器

```bash
npm run dev:all
```

### 4. 其他设备连接

在局域网内的其他设备上访问：
```
http://YOUR_IP:5173
```

## 公网联机（可选）

### 使用 ngrok

```bash
# 安装 ngrok
npm install -g ngrok

# 启动 ngrok 隧道
ngrok http 3000
ngrok http 5173
```

将 ngrok 提供的 URL 分享给朋友即可联机。

### 使用 VPS

1. 将代码部署到 VPS
2. 修改防火墙规则开放 3000 和 5173 端口
3. 使用 `pm2` 保持服务运行

```bash
npm install -g pm2
pm2 start npm --name "shotsgame-server" -- run server
pm2 start npm --name "shotsgame-frontend" -- run dev
```

## 开发命令

```bash
npm run dev        # 启动 Vite 开发服务器
npm run build      # 构建生产版本
npm run preview    # 预览生产构建
npm run server     # 启动 Socket.io 服务器
npm run dev:all    # 同时启动前端和后端
```

## 性能优化建议

1. **网络同步：** 当前使用 20Hz 更新率，可根据网络状况调整
2. **渲染优化：** 降低阴影质量、减少多边形数量
3. **移动端：** 关闭 CRT 扫描线效果以提升性能

## 故障排除

### 端口被占用

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Socket.io 连接失败

1. 检查服务器是否正常运行
2. 检查防火墙设置
3. 确认 URL 和端口正确

### 音效无法播放

浏览器要求用户交互后才能播放音频。确保点击"寻找对战"按钮后才初始化音频。

## 技术亮点

- ✅ Vue 3 Composition API
- ✅ TypeScript 类型安全
- ✅ Three.js 3D 渲染
- ✅ Socket.io 实时通信
- ✅ Web Audio API 音效生成
- ✅ Retro-Futurism 设计风格
- ✅ 响应式移动端适配

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

- [Three.js](https://threejs.org/) - 3D 图形库
- [Socket.io](https://socket.io/) - 实时通信
- [Vue 3](https://vuejs.org/) - 前端框架
- [Vite](https://vitejs.dev/) - 构建工具
